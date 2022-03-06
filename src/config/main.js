const appConfig = {
  inputRexExp: /^[a-zA-Z@.'\s\d-_]*$/g,
  passwordRexExp:
    // eslint-disable-next-line max-len
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[;:_,.\-ç°§òàù@#é*è+[\]{}|!"£$%&/()=?^\\'ì<>])/g,
}

export { appConfig }
