export function notSupported(functionName: string) {
  return () => {
    throw new Error(
      `\`${functionName}\` is not supported in Client Components.`,
    );
  };
}
