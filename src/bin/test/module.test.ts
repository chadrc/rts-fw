import {moduleCommand} from "../commands";
import * as fs from "fs-extra";

let workingDir = process.cwd() + "/tmp/rts-seed-tests/";
fs.mkdirsSync(workingDir);
process.chdir(workingDir);

function fileExists(path: string): boolean {
    return fs.existsSync(process.cwd() + path);
}

function getFileData(path: string): string {
    return fs.readFileSync(process.cwd() + path, "utf-8");
}

const moduleFilePath = "/app/modules/MyModule/MyModule.module.ts";
const componentFilePath = "/app/modules/MyModule/MyModule.component.ts";
const viewFilePath = "/app/modules/MyModule/MyModule.view.tsx";
const typesFilePath = "/app/modules/MyModule/MyModule.types.ts";

afterEach(() => {
    fs.removeSync(process.cwd() + "/app");
});

test('creates a component with component, view and types files', () => {
    moduleCommand("MyModule", false, false, false, false);

    expect(fileExists(moduleFilePath)).toBeTruthy();
    expect(fileExists(componentFilePath)).toBeTruthy();
    expect(fileExists(viewFilePath)).toBeTruthy();
    expect(fileExists(typesFilePath)).toBeTruthy();
});
