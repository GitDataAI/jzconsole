import React, { useState } from "react";
import Layout from "../../lib/components/layout";
import { useRouter } from "../../lib/hooks/router";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { users } from "../../lib/api/interface/index";
import { AlertError } from "../../lib/components/controls";

const RegisterForm = () => {
  const router = useRouter();
  const [RegisterError, setRegisterError] = useState<React.ReactElement | null>(
    null
  );
  const { next } = router.query;
  const reghandleclick = (e) => {
    e.preventDefault();
    router.push("/register");
  };
  const loghandleclick = (e) => {
    e.preventDefault();
    router.push("/login");
  };
  return (
    <Row className="justify-content-center align-items-center gx-0">
      <Col className="login-box">
        <img src="/jiaozifs.png" alt="JiaoZiFS" />
        <br />
        <h1 className="Signtittle">Register To JiaoZiFS</h1>
        <div style={{ width: "332px", fontSize: "14px" }}>
          {!!RegisterError && <AlertError error={RegisterError} />}
        </div>
        <Card className="login-widget jiaozi-login register">
          <Card.Header>
            {" "}
            <a href="" onClick={loghandleclick}>
              Sign In
            </a>{" "}
            <a href="#" onClick={reghandleclick} className="active">
              Create Account
            </a>
          </Card.Header>
          <Card.Body>
            <Form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const username = form.elements.namedItem(
                  "username"
                ) as HTMLInputElement;
                const password = form.elements.namedItem(
                  "password"
                ) as HTMLInputElement;
                const email = form.elements.namedItem(
                  "email"
                ) as HTMLInputElement;
                try {
                  await users.register({
                    name: username.value,
                    password: password.value,
                    email: email.value,
                  });
                  setRegisterError(null);
                  router.push(next ? next : "/login");
                } catch (err) {
                  if (password.value.length < 8) {
                    setRegisterError(
                      <span>
                        {"The password must contain at least 8 characters"}
                      </span>
                    );
                  } else if (!email.value) {
                    setRegisterError(<span>{"Please input your e-mail"}</span>);
                  }
                }
              }}
            >
              <p className="label-title">Username</p>
              <Form.Group controlId="username" className="mb-3">
                <Form.Control
                  type="text"
                  placeholder={"Access username"}
                  autoFocus
                />
              </Form.Group>
              <p className="label-title">Password</p>
              <Form.Group controlId="password" className="mb-3">
                <Form.Control type="password" placeholder={"Access password"} />
              </Form.Group>
              <p className="label-title">E-mail</p>
              <Form.Group controlId="email" className="mb-3">
                <Form.Control type="email" placeholder={"Access email"} />
              </Form.Group>

              <Button variant="primary" type="submit">
                Register
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

const RegisterPage = () => {
  return (
    <Layout logged={false}>
      <RegisterForm />
    </Layout>
  );
};
export default RegisterPage;
