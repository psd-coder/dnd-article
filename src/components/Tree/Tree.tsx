import { ReactNode } from "react";
import { Tree as TreeType } from "@/data";
import { List } from "@/components/List";
import { ListItem } from "@/components/ListItem";
import { FlattenedItem } from "./types";
import { isFlattenedFile, isFlattenedFolder } from "./utils";
import { FileIcon } from "@/components/FileIcon";
import { FolderIcon } from "@/components/FolderIcon";

import styles from "./Tree.module.css";
import { useTreeState } from "./state";

export interface TreeProps {
  tree: TreeType;
}

const renderAdornment = (item: FlattenedItem): ReactNode => {
  if (isFlattenedFolder(item)) {
    return <FolderIcon collapsed={item.collapsed} />;
  }

  if (isFlattenedFile(item)) {
    return <FileIcon filename={item.name} />;
  }

  return null;
};

export const Tree: React.FC<TreeProps> = ({ tree }) => {
  const { itemsToRender, actions } = useTreeState(tree);

  return (
    <div className={styles.container}>
      <List>
        {itemsToRender.map((item) => (
          <ListItem
            key={item.id}
            startAdornment={renderAdornment(item)}
            name={item.name}
            depth={item.depth}
            onClick={
              isFlattenedFolder(item)
                ? () => actions.toggleFolder(item.id)
                : undefined
            }
          />
        ))}
      </List>
    </div>
  );
};
