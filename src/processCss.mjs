import { readFile } from "fs";

class ProcessCss {
  constructor({ filePath, revision = null}) {
    this.filePath = filePath
    this.revision = revision
  }

  run() {
    return new Promise((resolve) => {
      readFile(this.filePath, "utf8",  (err, data) => {
        if (this.revision) {
          data = data
            .replace(/url\(["'](?!data)([^?"']+)\?([^#"']*)(?:#([^"']+))["']\)/g, `url($1?$2&revision=${this.revision}$3)`)
            .replace(/url\(["'](?!data)([^?"']+)["']\)/g, `url($1?revision=${this.revision})`)
        }
        resolve(data)
      })
    })
  }
}

export { ProcessCss }
