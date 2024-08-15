import { Button, Card, Col, Form, Row } from "react-bootstrap";
import React, { useState } from "react";
import { useRouter } from "../../lib/hooks/router";
import { IoHomeOutline } from "react-icons/io5";
import {
  GoRepo,
  GoRepoForked,
  GoArchive,
  GoMirror,
  GoRepoTemplate,
} from "react-icons/go";
import { RiGitRepositoryPrivateLine } from "react-icons/ri";
import { TbSourceCode } from "react-icons/tb";

const Repolistsnav = () => {
  const router = useRouter();
  const [filter, setFil] = useState("");

  const linkTo = (query: string) => {
    setFil(query);
    router.push({ pathname: `/repositories/`, query: { filter: query } });
  };
  return (
    <Row className="sidebar">
      <Form className="flex Fast-navb">
        <Col className="d-flex">
          <strong className="Navtittle">Repositories</strong>
        </Col>
        <Card>
          <Card.Body className="Nav-Card">
            <Button
              onClick={() => linkTo("")}
              className={filter == "" ? "active" : ""}
            >
              <IoHomeOutline />
              All
            </Button>
            <Button
              onClick={() => linkTo("Public")}
              className={filter == "Public" ? "active" : ""}
            >
              <GoRepo />
              Public
            </Button>
            <Button
              onClick={() => linkTo("Private")}
              className={filter == "Private" ? "active" : ""}
            >
              <RiGitRepositoryPrivateLine />
              Private
            </Button>
            <Button
              disabled
              onClick={() => linkTo("Sources")}
              className={filter == "Sources" ? "active" : ""}
            >
              <TbSourceCode />
              Sources
            </Button>
            <Button
              disabled
              onClick={() => linkTo("Forks")}
              className={filter == "Forks" ? "active" : ""}
            >
              <GoRepoForked />
              Forks
            </Button>
            <Button
              disabled
              onClick={() => linkTo("Archived")}
              className={filter == "Archived" ? "active" : ""}
            >
              <GoArchive />
              Archived
            </Button>
            <Button
              disabled
              onClick={() => linkTo("Mirrors")}
              className={filter == "Mirrors" ? "active" : ""}
            >
              <GoMirror />
              Mirrors
            </Button>
            <Button
              disabled
              onClick={() => linkTo("Templates")}
              className={filter == "Templates" ? "active" : ""}
            >
              <GoRepoTemplate />
              Templates
            </Button>
          </Card.Body>
        </Card>
      </Form>
    </Row>
  );
};

export default Repolistsnav;
