import { auth } from './auth.js'

(async () => {

  const { config, csrfTokenInfo } =  await auth();

  //Redirect to Qlik Cloud Hub URL with csrf token to avoid the CORS issue when redirecting
  let goto = `https://${config.tenantDomain}/sense/app/${config.appId}?qlik-csrf-token=${csrfTokenInfo.headers.get("qlik-csrf-token")}`;

  console.log('goto', goto);

    //add iframe
    console.log('goto', goto);

    var iframe = document.createElement('iframe');
    iframe.src = goto;
    iframe.frameBorder = '0';

    const container = document.querySelector('.container');

    container.appendChild(iframe);

  //window.open(goto, "_self");
  
})();