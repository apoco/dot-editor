import { OptionsPanelProps } from "../components/export/options-panel";
import { ComponentType } from "react";
import NoOptionsPanel from "../components/export/no-options-panel";
import ImageMapPanel from "../components/export/image-map-panel";
import PostScriptPanel from "../components/export/post-script-panel";
import GdPanel from "../components/export/gd-panel";
import JsonPanel from "../components/export/json-panel";
import PlainFormatPanel from "../components/export/plain-format-panel";
import SvgOptionsPanel from "../components/export/svg-options-panel";
import VmlOptionsPanel from "../components/export/vml-options-panel";

type ExportOption = {
  name: string,
  defaultExtension: string,
  defaultFormat: string,
  extensionFormats?: { [extension: string]: string },
  panel: ComponentType<OptionsPanelProps>
}

const exportOptions: Array<ExportOption> = [
  {
    name: 'SVG',
    defaultExtension: 'svg',
    defaultFormat: 'svg',
    extensionFormats: {
      svg: 'svg',
      svgz: 'svgz'
    },
    panel: SvgOptionsPanel
  },
  {
    name: 'PNG',
    defaultExtension: 'png',
    defaultFormat: 'png',
    panel: NoOptionsPanel
  },
  {
    name: 'WebP',
    defaultExtension: 'webp',
    defaultFormat: 'webp',
    panel: NoOptionsPanel
  },
  {
    name: 'GIF',
    defaultExtension: 'gif',
    defaultFormat: 'gif',
    panel: NoOptionsPanel
  },
  {
    name: 'JPEG',
    defaultExtension: 'jpg',
    defaultFormat: 'jpg',
    extensionFormats: {
      jpg: 'jpg',
      jpeg: 'jpeg',
      jpe: 'jpe',
      jif: 'jpeg',
      jfif: 'jpeg',
      jfi: 'jpeg'
    },
    panel: NoOptionsPanel
  },
  {
    name: 'JPEG 2000',
    defaultExtension: 'jp2',
    defaultFormat: 'jp2',
    extensionFormats: {
      jp2: 'jp2',
      j2k: 'jp2',
      jpf: 'jp2',
      jpx: 'jp2',
      jpm: 'jp2',
      mj2: 'jp2'
    },
    panel: NoOptionsPanel
  },
  {
    name: 'PDF',
    defaultExtension: 'pdf',
    defaultFormat: 'pdf',
    panel: NoOptionsPanel
  },
  {
    name: 'Adobe PhotoShop',
    defaultExtension: 'psd',
    defaultFormat: 'psd',
    panel: NoOptionsPanel
  },
  {
    name: 'PostScript',
    defaultExtension: 'ps',
    defaultFormat: 'ps2',
    extensionFormats: {
      ps: 'ps2',
      ps2: 'ps2',
      ps3: 'ps2'
    },
    panel: PostScriptPanel
  },
  {
    name: 'Encapsulated PostScript',
    defaultExtension: 'eps',
    defaultFormat: 'eps',
    panel: NoOptionsPanel
  },
  {
    name: 'Windows Bitmap',
    defaultExtension: 'bmp',
    defaultFormat: 'bmp',
    panel: NoOptionsPanel
  },
  {
    name: 'Image Map',
    defaultExtension: 'html',
    defaultFormat: 'cmapx',
    panel: ImageMapPanel
  },
  {
    name: 'TIFF',
    defaultExtension: 'tif',
    defaultFormat: 'tif',
    extensionFormats: {
      tif: 'tif',
      tiff: 'tif'
    },
    panel: NoOptionsPanel
  },
  {
    name: 'TGA',
    defaultExtension: 'tga',
    defaultFormat: 'tga',
    extensionFormats: {
      tga: 'tga',
      icb: 'tga',
      vda: 'tga',
      vst: 'tga'
    },
    panel: NoOptionsPanel
  },
  {
    name: 'Silicon Graphics Image',
    defaultExtension: 'sgi',
    defaultFormat: 'sgi',
    panel: NoOptionsPanel
  },
  {
    name: 'JSON',
    defaultExtension: 'json',
    defaultFormat: 'dot_json',
    panel: JsonPanel
  },
  {
    name: 'Xfig',
    defaultExtension: 'fig',
    defaultFormat: 'fig',
    panel: NoOptionsPanel
  },
  {
    name: 'TK Graphics',
    defaultExtension: 'tk',
    defaultFormat: 'tk',
    panel: NoOptionsPanel
  },
  {
    name: 'Apple PICT',
    defaultExtension: 'pict',
    defaultFormat: 'pct',
    extensionFormats: {
      pict: 'pct',
      pct: 'pct',
      pic: 'pct'
    },
    panel: NoOptionsPanel
  },
  {
    name: 'Pic',
    defaultExtension: 'pic',
    defaultFormat: 'pic',
    panel: NoOptionsPanel
  },
  {
    name: "Windows Icon",
    defaultExtension: 'ico',
    defaultFormat: 'ico',
    panel: NoOptionsPanel
  },
  {
    name: 'VML',
    defaultExtension: 'html',
    defaultFormat: 'vml',
    panel: VmlOptionsPanel
  },
  {
    name: 'POV-Ray',
    defaultExtension: 'pov',
    defaultFormat: 'pov',
    panel: NoOptionsPanel
  },
  {
    name: 'VRML',
    defaultExtension: 'wrl',
    defaultFormat: 'vrml',
    panel: NoOptionsPanel
  },
  {
    name: 'CGImage Bitmap',
    defaultExtension: 'cgi',
    defaultFormat: 'cgimage',
    panel: NoOptionsPanel
  },
  {
    name: "GD",
    defaultExtension: 'gd2',
    defaultFormat: 'gd2',
    extensionFormats: {
      gd: 'gd',
      gd2: 'gd2'
    },
    panel: GdPanel
  },
  {
    name: 'OpenEXR',
    defaultExtension: 'exr',
    defaultFormat: 'exr',
    panel: NoOptionsPanel
  },
  {
    name: 'Wireless Bitmap',
    defaultExtension: 'wbmp',
    defaultFormat: 'wbmp',
    panel: NoOptionsPanel
  },
  {
    name: 'Plain',
    defaultExtension: 'txt',
    defaultFormat: 'plain',
    panel: PlainFormatPanel
  }
];

/*
  TODO:
    * Pretty-print with canon
    * Attributed DOT file creation (maybe after adding drag/drop?

  Won't do?
    * gtk
    * xlib/x11
 */

export default exportOptions;
