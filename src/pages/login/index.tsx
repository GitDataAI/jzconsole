import React, { useState } from "react";
import Layout from "../../lib/components/layout";
import { Button, Col, Form, Card, Row, Spinner } from "react-bootstrap";
import { auth as Auth, cache } from "../../lib/api";
import { AlertError } from "../../lib/components/controls";
import { useRouter } from "../../lib/hooks/router";
import { auth, users } from "../../lib/api/interface/index";
// import {AiOutlineGithub,AiFillGitlab,AiFillGoogleCircle,AiFillTwitterCircle} from "react-icons/ai";

const LoginForm = () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState<React.ReactElement | null>(null);
  const [loading, setLoading] = useState(false);
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
        <img src="/jiaozifs.png" alt="JiaoziFS" />
        <br />
        <strong className="Signtittle">Sign in To JiaoziFS</strong>
        <Card className="login-widget jiaozi-login">
          <Card.Header>
            {" "}
            <a href="" onClick={loghandleclick} className="active">
              Sign In
            </a>{" "}
            <a href="#" onClick={reghandleclick}>
              Create Account
            </a>
          </Card.Header>
          <Card.Body>
            <Form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                const form = e.target as HTMLFormElement;
                const username = form.elements.namedItem(
                  "username"
                ) as HTMLInputElement;
                const password = form.elements.namedItem(
                  "password"
                ) as HTMLInputElement;
                try {
                  const response = await auth.login({
                    name: username.value,
                    password: password.value,
                  });
                  Auth.clearCurrentUser();
                  cache.set("token", response.data.token);
                  await users.getUserInfo().then((response) => {
                    cache.set("user", response.data.name);
                    setLoginError(null);
                    router.push(next ? next : "/repositories");
                  });
                } catch (err) {
                  console.log(err);

                  setLoginError(
                    <span>
                      {
                        "Check your username or password,and password must contain at least 8 characters"
                      }
                    </span>
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Form.Group controlId="username" className="mb-3">
                <strong>Username</strong>
                <Form.Control
                  type="text"
                  placeholder={"Access username"}
                  autoFocus
                  autoComplete="current-password"
                />
              </Form.Group>

              <Form.Group controlId="password" className="mb-3">
                <strong>Password</strong>
                <Form.Control
                  type="password"
                  placeholder={"Access password"}
                  autoComplete="current-password"
                />
              </Form.Group>

              {loginError && <AlertError error={loginError} />}

              <Button variant="primary" type="submit">
                <div>
                  {loading && (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      style={{ marginRight: "10px" }}
                    />
                  )}
                  Login
                </div>
              </Button>
              {/* <div className="waytologin">
                                <p>————Try another way to login————</p>
                                <div className="ways">
                                <div className="item">
                                <a href="#"><AiOutlineGithub /></a>
                                </div>
                                <div className="item">
                                <a href="#"><AiFillGitlab /></a>
                                </div>
                                <div className="item">
                                <a href="#"><AiFillGoogleCircle /></a>
                                </div>
                                <div className="item">
                                <a href="#"><AiFillTwitterCircle /></a>
                                </div>
                                </div>
                            </div> */}
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

const LoginPage = () => {
  return (
    <Layout logged={false}>
      <LoginForm />
    </Layout>
  );
};

export default LoginPage;
