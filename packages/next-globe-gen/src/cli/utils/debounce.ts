// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<A extends any[]>(
  callback: (...args: A) => void,
  delay: number,
) {
  let timer: NodeJS.Timeout;
  return function (...args: A) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
