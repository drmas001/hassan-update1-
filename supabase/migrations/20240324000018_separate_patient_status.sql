-- First, drop dependent triggers
DROP TRIGGER IF EXISTS on_patient_status_change ON patients;
DROP TRIGGER IF EXISTS patient_status_change_trigger ON patients;
DROP TRIGGER IF EXISTS on_status_change ON patients;

-- Add new columns for condition and discharge_status
ALTER TABLE patients 
  ADD COLUMN IF NOT EXISTS condition VARCHAR(20),
  ADD COLUMN IF NOT EXISTS discharge_status VARCHAR(20),
  ADD COLUMN IF NOT EXISTS discharge_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;

-- Migrate existing status data
UPDATE patients 
SET 
  condition = CASE 
    WHEN status IN ('Active', 'Critical', 'DNR') THEN status 
    ELSE 'Active' 
  END,
  discharge_status = CASE 
    WHEN status = 'Discharged' THEN 'Discharged'
    ELSE 'Admitted'
  END;

-- Now we can safely drop the old status column and constraints
ALTER TABLE patients 
  DROP CONSTRAINT IF EXISTS patients_status_check,
  DROP COLUMN IF EXISTS status;

-- Add new constraints
ALTER TABLE patients 
  ADD CONSTRAINT patients_condition_check 
    CHECK (condition IN ('Active', 'Critical', 'DNR')),
  ADD CONSTRAINT patients_discharge_status_check 
    CHECK (discharge_status IN ('Admitted', 'Pending', 'Discharged'));

-- Create function to handle visibility after discharge
CREATE OR REPLACE FUNCTION update_patient_visibility()
RETURNS void AS $$
BEGIN
  UPDATE patients
  SET visible = false
  WHERE 
    discharge_status = 'Discharged' 
    AND discharge_date < NOW() - INTERVAL '24 hours'
    AND visible = true;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle condition change notifications
CREATE OR REPLACE FUNCTION handle_patient_condition_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.condition != OLD.condition THEN
    INSERT INTO notifications (
      type,
      message,
      severity,
      patient_id,
      created_at
    )
    VALUES (
      'condition',
      'Patient condition changed to ' || NEW.condition,
      CASE 
        WHEN NEW.condition = 'Critical' THEN 'critical'
        WHEN NEW.condition = 'DNR' THEN 'warning'
        ELSE 'info'
      END,
      NEW.id,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle discharge status change notifications
CREATE OR REPLACE FUNCTION handle_discharge_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discharge_status != OLD.discharge_status THEN
    -- Update discharge_date when status changes to Discharged
    IF NEW.discharge_status = 'Discharged' AND OLD.discharge_status != 'Discharged' THEN
      NEW.discharge_date := NOW();
    END IF;

    INSERT INTO notifications (
      type,
      message,
      severity,
      patient_id,
      created_at
    )
    VALUES (
      'discharge',
      'Patient discharge status changed to ' || NEW.discharge_status,
      CASE 
        WHEN NEW.discharge_status = 'Discharged' THEN 'warning'
        ELSE 'info'
      END,
      NEW.id,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new triggers for the new columns
CREATE TRIGGER on_patient_condition_change
  AFTER UPDATE OF condition ON patients
  FOR EACH ROW
  EXECUTE FUNCTION handle_patient_condition_change();

CREATE TRIGGER on_discharge_status_change
  BEFORE UPDATE OF discharge_status ON patients
  FOR EACH ROW
  EXECUTE FUNCTION handle_discharge_status_change();

-- Create scheduled task to update visibility (requires pg_cron extension)
-- Note: This needs to be run by a superuser
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('*/30 * * * *', 'SELECT update_patient_visibility();');