import Logger from './classes/logger.js';

const logger = new Logger(process.stdout);

await logger.log(process.argv[2]);