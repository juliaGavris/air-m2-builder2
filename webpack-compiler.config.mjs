export default ({ entry, path, filename, mode = "development" }) => {
  return {
    mode,
    entry,
    externals: { m2: "__M2" },
    output: {
      path,
      filename,
      library: "__m2unit__",
      libraryTarget: "this"
    }
  };
};
