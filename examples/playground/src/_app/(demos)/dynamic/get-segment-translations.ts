export async function getSegmentTranslations() {
  await new Promise((res) => setTimeout(res, 1000));
  return {
    fi: "dynaaminen",
  };
}
