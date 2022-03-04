export const cozyLog = (...messages: any) => {
  if (process.env.ENV !== 'production') {
    console.log('%cDEBUG', 'color:yellow;', ...messages);
  }
};
