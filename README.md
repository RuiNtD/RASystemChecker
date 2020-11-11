# RetroArch System Checker

Despite the name, this is not a PC tuneup tool. This is a utility program for RetroArch.
This tool will help verify and organize BIOS files used by RetroArch.

## Setup

You will need [Node.js](https://nodejs.org/) to use this tool.
Run these two commands in the same folder as `index.js`:

```
npm install
node update
```

## Usage

- `node index`: Shows a list of BIOS files along with checksums.
  - Any checksum type that is shown in green is correct.
  - If a checksum is shown in red, the checksum failed, meaning you likely have the wrong BIOS file.
  - `INCAP` is shown if a BIOS has a filename with INcorrect CAPitalization. This should only matter on Linux.
  - Additionally, you can add the `onlybad` parameter to only show bad or missing BIOS files.
  - If your console doesn't support color, only incorrect checksums are shown. Correct checksums are hidden.
  - If, for some reason, colors don't show up correctly, you can add the parameter `--no-color` to force colors off. The rules above will apply.
- `node drop`
  - This command will search through the `drop` folder for any matching BIOS files.
  - If a file is found, it's copied to `system` in a folder with the core's name and with the correct filename.
  - After running this command, the `drop` folder should be emptied so the old files aren't scanned again.
  - This command is useful if you have several BIOS files for several different models and regions, and you don't know which one you need.
- `node update`: Downloads and updates the BIOS database.
