import * as path from "path";
import * as fs from "fs";
import * as glob from "glob";
import * as Templates from './templates'
import {ensureDir, isJsIdentifier, writeFile} from "./Utils";

export function manifestCommand(basePath: string): void {
    let pattern = process.cwd() + "/app/modules/**/*.module.ts";
    let moduleFiles = glob.sync(pattern);
    let details = [];
    for (let m of moduleFiles) {
        let name = path.basename(m).replace(".module.ts", "");
        let stylePath = path.dirname(m) + "/styles.scss";
        let hasStyles = fs.existsSync(stylePath);
        details.push({
            name: name,
            hasStyles: hasStyles
        });
    }
    let text = Templates.makeModuleManifestFile(details);
    writeFile(`${basePath}module.manifest.ts`, text);
}

export function projectCommand(appName: string, version: string, basePath: string,
                               noMod: boolean, noComp: boolean, noStyles: boolean,
                               noView: boolean, noTypes: boolean): void {
    if (!appName) {
        console.error("No app name provided.");
        return;
    }

    createProject(appName, basePath, version);

    if (!noMod) {
        let moduleName = appName.replace(/ /g, "");
        if (isJsIdentifier(moduleName)) {
            createModule(moduleName, noComp, noStyles);
            if (!noComp) {
                createComponent(moduleName, `${moduleName}/${moduleName}`, noView, noTypes);
            }
        } else {
            console.log("Initial module could not be created. App name could not be turned into valid JavaScript identifier.");
        }
    }
}

export function moduleCommand(moduleName: string, noComp: boolean, noStyles: boolean,
                              noTypes: boolean, noView: boolean): void {
    if (isJsIdentifier(moduleName)) {
        createModule(moduleName, noComp, noStyles);
        if (!noComp) {
            createComponent(moduleName, `${moduleName}/${moduleName}`, noTypes, noView);
        }
    }
}

export function componentCommand(componentPath: string, noView: boolean, noTypes: boolean): void {
    let componentName = path.basename(componentPath);
    if (isJsIdentifier(componentName)) {
        createComponent(componentName, componentPath, noView, noTypes);
    } else {
        console.error("Invalid identifier: " + componentName);
    }
}

export function createComponent(componentName: string, componentPath: string, noView: boolean, noTypes: boolean) {
    let componentData = Templates.makeComponentFile(componentName, noTypes, noView);
    let viewData = Templates.makeViewFile(componentName, noTypes);
    let typesData = Templates.makeTypesFile(componentName);
    let localDir = `/app/modules/${componentPath}`;
    ensureDir(localDir);
    let basePath = process.cwd() + localDir;
    let componentFilePath = `${basePath}.component.ts`;
    if (fs.existsSync(componentFilePath)) {
        console.error("Component already exists.");
        return;
    }
    writeFile(componentFilePath, componentData);
    if (!noView) {
        writeFile(`${basePath}.view.tsx`, viewData);
    }
    if (!noTypes) {
        writeFile(`${basePath}.types.ts`, typesData);
    }
}

export function createModule(moduleName: string, noComp: boolean, noStyles: boolean): void {
    let moduleDetails = Templates.makeModuleFile(moduleName, noComp, noStyles);
    let localDir = `/app/modules/${moduleName}/`;
    ensureDir(localDir);
    let basePath = process.cwd() + localDir;
    let moduleFilePath = `${basePath}/${moduleName}.module.ts`;
    if (fs.existsSync(moduleFilePath)) {
        console.error("Module already exists.");
        return;
    }
    writeFile(moduleFilePath, moduleDetails);
    if (!noStyles) {
        writeFile(`${basePath}/styles.scss`, "");
    }
}

export function createProject(appName: string, basePath: string, version: string): void {

    let filesToCopy: string[] = [
        "webpack.config.js",
        "tsconfig.json"
    ];
    for (let filename of filesToCopy) {
        fs.createReadStream(`${__dirname.replace("/bin", "")}/seed/${filename}`).pipe(fs.createWriteStream(`${process.cwd()}/${filename}`));
    }

    let indexTsxData = Templates.makeIndexTSXFile(appName);
    let indexHtmlData = Templates.makeIndexHTMLFile(appName);
    let pkgJsonData = Templates.makePackageJSONFile(appName, version);

    writeFile(`${process.cwd()}/package.json`, pkgJsonData);
    writeFile(`${basePath}/index.html`, indexHtmlData);
    writeFile(`${basePath}/index.tsx`, indexTsxData);
}