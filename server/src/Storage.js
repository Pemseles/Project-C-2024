const pathLib = require("path");
const fsPromises = require("fs/promises");
const fs = require("fs");

class Storage {
  constructor() {
    this.storagePathAbsolute = pathLib.normalize(process.cwd() + "/storage");
    this.storagePathRelative = pathLib.normalize("/storage");
    this.imageDirName = "images";
    this.designDirName = "designs";
    this.templateDirName = "templates";
  }
  
  async addFileToStorage(path, data) {
    try {
      const normalizedPath = pathLib.normalize(path);
      const parsedPath = pathLib.parse(normalizedPath);

      if (!fs.existsSync(parsedPath.dir)) {
        await fsPromises.mkdir(parsedPath.dir, { recursive: true }, (err) => { if (err) throw err; });
      }

      fsPromises.appendFile(normalizedPath, data, (err) => { if (err) throw err; })

      return null;
    } catch (error) {
      return error;
    }
  }

  async removeFile(filePath) {
    fsPromises.rm(path.normalize(filePath), {}, (err) => { if (err) throw err; });
  }

  async addCompany(companyId, sync = false) {
    if (!sync) {
      fsPromises.mkdir(
        pathLib.normalize(this.storagePathAbsolute + `/${companyId}/${this.imageDirName}`),
        { recursive: true },
        (err) => {
          if (err) throw err;
        }
      );

      fsPromises.mkdir(
        pathLib.normalize(
          this.storagePathAbsolute + `/${companyId}/${this.templateDirName}`
        ),
        { recursive: true },
        (err) => {
          if (err) throw err;
        }
      );

      fsPromises.mkdir(
        pathLib.normalize(this.storagePathAbsolute + `/${companyId}/${this.designDirName}`),
        { recursive: true },
        (err) => {
          if (err) throw err;
        }
      );
    } else {
      await fsPromises.mkdir(
        pathLib.normalize(this.storagePathAbsolute + `/${companyId}/${this.imageDirName}`),
        { recursive: true },
        (err) => {
          if (err) throw err;
        }
      );

      await fsPromises.mkdir(
        pathLib.normalize(
          this.storagePathAbsolute + `/${companyId}/${this.templateDirName}`
        ),
        { recursive: true },
        (err) => {
          if (err) throw err;
        }
      );

      await fsPromises.mkdir(
        pathLib.normalize(this.storagePathAbsolute + `/${companyId}/${this.designDirName}`),
        { recursive: true },
        (err) => {
          if (err) throw err;
        }
      );
    }
  }

  async removeCompany(companyId) {
    fsPromises.rm(
      path.normalize(this.storagePathAbsolute + `/${companyId}`),
      { recursive: true, force: true },
      (err) => { if (err) throw err; }
    );
  }

  async addImage(fileName, companyId, dataUrl) {
    return this.addFileToStorage(`${this.storagePathAbsolute}/${companyId}/${this.imageDirName}/${fileName}`, Buffer.from(dataUrl.split(",")[1], "base64"));
  }

  async removeImage(companyId, imageName) {
    this.removeFile(`${this.storagePathAbsolute}/${companyId}/${this.imageDirName}/${imageName}`)
  }

  async addTemplate(templateName, companyId, data) {
    return this.addFileToStorage(`${this.storagePathAbsolute}/${companyId}/${this.templateDirName}/${templateName}.html`, data);
  }

  async removeTemplate(companyId, templateName) {
    this.removeFile(`${this.storagePathAbsolute}/${companyId}/${this.templateDirName}/${templateName}.html`)
  }

  async addDesign(designName, companyId, templateId, data) {
    return this.addFileToStorage(`${this.storagePathAbsolute}/${companyId}/${this.designDirName}/${templateId}/${designName}.html`, data);
  }

  async removeDesign(designName, companyId, templateId) {
    this.removeFile(`${this.storagePathAbsolute}/${companyId}/${this.designDirName}/${templateId}/${designName}.html`)
  }
}

module.exports = Storage;
