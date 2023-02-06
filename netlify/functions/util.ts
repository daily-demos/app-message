const dailyAPIUrl = (): string => {
  return process.env.IS_STAGING
    ? 'https://api.staging.daily.co/v1'
    : 'https://api.daily.co/v1';
};
export default dailyAPIUrl();
