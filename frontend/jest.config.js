module.exports = {
    transformIgnorePatterns: [
      "/node_modules/(?!axios).+\\.js$"
    ],
    transform: {
      "^.+\\.js$": "babel-jest"
    },
    transformIgnorePatterns: ["node_modules/(?!axios)"],

  };