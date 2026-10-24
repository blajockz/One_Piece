import { useEffect, useState } from 'react';
import { getStaffPin, onStaffPinChange, setStaffPin } from '../api/staffPin';

/** Whether this device has unlocked the staff pages. */
export function useStaff() {
  const [pin, setPin] = useState(getStaffPin);
  useEffect(() => onStaffPinChange(() => setPin(getStaffPin())), []);
  return { unlocked: !!pin, lock: () => setStaffPin(null) };
}
