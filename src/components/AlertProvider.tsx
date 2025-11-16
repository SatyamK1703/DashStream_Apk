import React from 'react';
import CustomAlert, { useCustomAlert } from './CustomAlert';

const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentAlert } = useCustomAlert();

  return (
    <>
      {children}
      {currentAlert && <CustomAlert {...currentAlert} />}
    </>
  );
};

export default AlertProvider;