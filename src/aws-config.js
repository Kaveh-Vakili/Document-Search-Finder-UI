// aws-config.js
const awsconfig = {
    Auth: {
      region: 'us-east-1',
      userPoolId: 'us-east-1_TX76wzfoG',
      userPoolWebClientId: '7v9ur8ejmrol0r2ok8qfsq4t5n', // Use THIS Client ID
      mandatorySignIn: false,
      authenticationFlowType: 'USER_PASSWORD_AUTH',
      // DO NOT include clientSecret - it doesn't exist for this app client
    }
  };
  
  export default awsconfig;