import { FC } from "react";
import { ReactComponent as IconFileCss } from "@/components/Icon/FileCss.svg";
import { ReactComponent as IconFileTs } from "@/components/Icon/FileTs.svg";
import { ReactComponent as IconFileTsx } from "@/components/Icon/FileTsx.svg";

import styles from "./FileIcon.module.css";

const ICON_BY_EXTENSION: Record<string, FC> = {
  css: IconFileCss,
  ts: IconFileTs,
  tsx: IconFileTsx,
};

const EXTENSION_REGEXP = /\.(\w+)$/;
const getIconByFilename = (filename: string) => {
  const match = filename.match(EXTENSION_REGEXP);
  const extension = match?.[1];

  if (!match || !extension || !ICON_BY_EXTENSION[extension]) {
    return <span className={styles.iconFallback} />;
  }

  const Icon = ICON_BY_EXTENSION[extension];

  return <Icon />;
};

export interface FileIconProps {
  filename: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ filename }) =>
  getIconByFilename(filename);
