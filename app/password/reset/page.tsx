import ResetPassword from '@/components/auth/resetPassword';
import React from 'react'

const ResetPasswrodPage = ({params}: { params : {token:string}}) => {
    const { token } = params;

  return <ResetPassword token={token} />;
    
  
}

export default ResetPasswrodPage