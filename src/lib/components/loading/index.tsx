import React, { useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import "../../../styles/loading.css";
import { version } from "../../api/interface";
const Loadingpage = () => {
  const [loading, setLoading] = useState(0);
  const [ver, setVer] = useState({});
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  const getversion = async () => {
    const response = await version.getVersion();
    setVer(response.data);
    return response;
  };
  useEffect(() => {
    if (localStorage.getItem("hasVisited")) {
      setIsFirstVisit(false);
    }
  }, []);

  useEffect(() => {
    getversion();
  }, []);
  useEffect(() => {
    if (loading == 100) {
      localStorage.setItem("hasVisited", "true");
    } else if (loading < 100) {
      let randomNum = Math.floor(Math.random() * 5) + 1;
      setTimeout(() => {
        setLoading(loading + randomNum > 100 ? 100 : loading + randomNum);
      }, 500);
    }
  }, [loading]);
  if (!isFirstVisit) {
    return <div>loading...</div>;
  }

  const spanList = Array.from({ length: 8 }, (_, index) => index + 1);

  // generate span
  const rotateList = Array.from({ length: 5 }, (_, index) => index);
  return (
    <>
      {/* <div className="welcome">
        <img src="/jiaozifs.png" />
        <h1>Welcome to JiaoziFS Cloud</h1>
        <code>
          Get started with a fully functional playground environment and start
          data versioning at scale today!
        </code>
        <br />
        <code>
          No deployment, installing, maintaining and scaling overhead.
        </code>
      </div> */}
      <div className="loading">
        <div className="Progress">
          {/* <div className="version">{loading>=80?<span>version: {ver.version}</span>:<span>It's getting version from server now</span>}</div>
            <ProgressBar animated now={loading} /> */}
          <div className="box">
            <svg>
              <filter id="fluid">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                <feColorMatrix
                  values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 20 -10
                "
                ></feColorMatrix>
              </filter>
            </svg>
            <div className="loader">
              {spanList.map((i) => (
                <span key={i} style={{ "--i": i }}></span>
              ))}
              {rotateList.map((j) => (
                <span key={j} className="rotate" style={{ "--j": j }}></span>
              ))}
            </div>
          </div>
          <div className="content">
            <img src="/jiaozifs.png" />
          </div>
        </div>
      </div>
    </>
  );
};
export default Loadingpage;
