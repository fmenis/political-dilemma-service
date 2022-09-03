const appConfig = {
  inputRexExp: /^[a-zA-Z@.'\s\d-_]*$/g,
  passwordRexExp:
    // eslint-disable-next-line max-len
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[;:_,.\-ç°§òàù@#é*è+[\]{}|!"£$%&/()=?^\\'ì<>])/g,
  upload: {
    allowedFileExts: ['png', 'jpg', 'jpeg'],
    maxSize: 5, // MB,
    maxUploadsForRequeset: 10,
  },
  pagination: {
    defaultLimit: 10,
    defaultOffset: 0,
  },
}

export { appConfig }
