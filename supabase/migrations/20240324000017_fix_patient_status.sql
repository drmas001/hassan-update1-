-- First, update any existing statuses
UPDATE patients 
SET status = 'Active' 
WHERE status NOT IN ('Active', 'Critical', 'DNR');

-- Update the status check constraint
ALTER TABLE patients 
  DROP CONSTRAINT IF EXISTS patients_status_check;

ALTER TABLE patients 
  ADD CONSTRAINT patients_status_check 
  CHECK (status IN ('Active', 'Critical', 'DNR'));

-- Create or replace the notification function
CREATE OR REPLACE FUNCTION create_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (
      type,
      message,
      severity,
      patient_id,
      created_at
    )
    VALUES (
      'status',
      'Patient status changed to ' || NEW.status,
      CASE 
        WHEN NEW.status = 'Critical' THEN 'critical'
        ELSE 'info'
      END,
      NEW.id,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_status_change ON patients;

-- Create new trigger
CREATE TRIGGER on_status_change
  AFTER UPDATE OF status ON patients
  FOR EACH ROW
  EXECUTE FUNCTION create_status_notification();