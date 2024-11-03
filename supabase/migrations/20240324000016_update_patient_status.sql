-- Update the status check constraint for patients table
ALTER TABLE patients 
  DROP CONSTRAINT IF EXISTS patients_status_check;

ALTER TABLE patients 
  ADD CONSTRAINT patients_status_check 
  CHECK (status IN ('Active', 'Critical', 'DNR'));

-- Create function to handle status change notifications
CREATE OR REPLACE FUNCTION handle_patient_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (
      type,
      message,
      severity,
      user_id,
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
      NEW.attending_physician_id,
      NEW.id,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS patient_status_change_trigger ON patients;
CREATE TRIGGER patient_status_change_trigger
  AFTER UPDATE OF status ON patients
  FOR EACH ROW
  EXECUTE FUNCTION handle_patient_status_change();