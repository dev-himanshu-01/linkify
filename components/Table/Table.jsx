import { Table, Row, Col, Tooltip, Text } from "@nextui-org/react";
import { IconButton } from "./IconButton";
import { DeleteIcon } from "./DeleteIcon";
import styles from "./Table.module.css";
import { formatDistanceToNowStrict } from "date-fns";
import Image from "next/image";
import { getDocs, collection } from "firebase/firestore/lite";
import { db } from "@/firebase";
import React, { useState, useEffect } from "react";

export default function App() {
  const [data, setData] = useState([]);
  const [showTable, setShowTable] = useState({ user: "SIGN_OUT" });
  const columns = [
    { name: "FULL URL", uid: "full_url" },
    { name: "SHORTENED URL", uid: "shortened_url" },
    { name: "TIME", uid: "date" },
    { name: "ACTIONS", uid: "actions" },
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, userData.email));
      const dataArray = [];

      if (!querySnapshot.docs == []) {
        setShowTable({ user: "SIGN_IN_DATA" });
        querySnapshot.forEach((doc) => {
          const CODE_VAL = doc.data().code;
          const FULL_URL = doc.data().originalURL;
          const DATE = doc.data().date;

          console.log(doc.data());

          dataArray.push({
            id: CODE_VAL,
            code: CODE_VAL,
            originalURL: FULL_URL,
            date: DATE,
          });
        });
      } else {
        setShowTable({ user: "SIGN_OUT" });
      }

      setData(dataArray);
    };

    try {
      if (userData.isLoggedIn) {
        fetchData();
      }
    } catch {
      setShowTable({ user: "SIGN_OUT" });
    }
  }, []);

  const renderCell = (user, columnKey) => {
    const cellValue = user[columnKey];
    switch (columnKey) {
      case "full_url":
        return (
          <textarea readOnly value={user.originalURL} resize="none" rows={1} className={styles.FullUrl}/>
        );

      case "shortened_url":
        return (
          <Tooltip content="Click to copy">
            <Col
              onClick={() =>
                navigator.clipboard.writeText(`linkfy.web.app/${user.code}`)
              }
            >
              <Row>
                <Text>{cellValue}</Text>
              </Row>
              <Row>
                <Text
                  className={styles.ShortenedUrl}
                >{`linkfy.web.app/${user.code}`}</Text>
              </Row>
            </Col>
          </Tooltip>
        );

      case "date":
        return (
          <Text className={styles.Date}>
            {formatDistanceToNowStrict(new Date(user.date), {
              addSuffix: true,
            })}
          </Text>
        );

      case "actions":
        return (
          <Row justify="space-between" gap="0.5" align="center">
            <Col>
              <Tooltip content="QR-Code">
                <IconButton onClick={() => console.log("View user", user.id)}>
                  <Image
                    src={"/qr.svg"}
                    width={20}
                    height={20}
                    alt="rq-code-icon"
                  />
                </IconButton>
              </Tooltip>
            </Col>
            <Col>
              <Tooltip
                content="Delete"
                color="error"
                onClick={() => console.log("Delete user", user.id)}
              >
                <IconButton>
                  <DeleteIcon size={20} fill="#FF0080" />
                </IconButton>
              </Tooltip>
            </Col>
          </Row>
        );

      default:
        return cellValue;
    }
  };

  return showTable.user === "SIGN_IN_DATA" ? (
    <section className={styles.Main}>
      <h2>👉 Previous Shortened Links</h2>
      <Table
        aria-label="All Shortened URLS with their Full URLS"
        selectionMode="none"
        className={styles.Table}
      >
        <Table.Header columns={columns}>
          {(column) => (
            <Table.Column
              className={styles.ColumnHead}
              key={column.uid}
              hideHeader={column.uid === "actions"}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </Table.Column>
          )}
        </Table.Header>

        <Table.Body items={data} className={styles.TableBody}>
          {(item) => (
            <Table.Row>
              {(columnKey) => (
                <Table.Cell
                  css={{ padding: "1em 2.5em" }}
                  className={styles.TableCell}
                >
                  {renderCell(item, columnKey)}
                </Table.Cell>
              )}
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </section>
  ) : (
    <></>
  );
}

/* 
sign in - data-hai: table ✅
|       - data-nhi: no table 👎  
| 
sign in nhi hai - no table 👎





SIGN_OUT : no table👎
SIGN_IN_DATA: table ✅
SIGN_IN_NO_DATA: no table 👎 

*/
