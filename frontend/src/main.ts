import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';


// Bootstrap the Angular application with the root component and application configuration
// helps to handle any errors that may occur during the bootstrap process.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
