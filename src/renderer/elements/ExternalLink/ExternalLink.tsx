import React, { useCallback } from 'react';
import { shell } from 'electron';

import styles from './ExternalLink.module.css';

interface Props {
  children: string;
  href: string;
}

const ExternalLink: React.FC<Props> = (props) => {
  const openLink = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      shell.openExternal(props.href);
    },
    [props.href]
  );

  return (
    <button className={styles.externalLink} role='link' onClick={openLink}>
      {props.children}
    </button>
  );
};

export default ExternalLink;
