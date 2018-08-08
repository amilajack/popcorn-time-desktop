import configStoreProd from './configureStore.prod';
import configStoreDev from './configureStore.dev';

export default (process.env.NODE_ENV === 'production'
  ? configStoreProd
  : configStoreDev);
