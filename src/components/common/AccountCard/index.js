import React from "react";
import styles from "./style.module.scss";

export default function AccountCard(props) {
  const { title, text } = props;

  return (
    <div className={styles.item}>
      <h2>{title}</h2>
      <div className={styles.text}>{text}</div>
    </div>
  );
}
