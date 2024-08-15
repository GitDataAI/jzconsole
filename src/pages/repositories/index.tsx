import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ButtonToolbar,
  Card,
  Container,
  Dropdown,
  Form,
  FormControl,
} from "react-bootstrap";
import { GoRepoPush } from "react-icons/go";
import { HiSortAscending } from "react-icons/hi";
import { PiSortAscendingBold } from "react-icons/pi";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Layout from "../../lib/components/layout";
import { ActionsBar } from "../../lib/components/controls";
import { cache } from "../../lib/api";
import { useRouter } from "../../lib/hooks/router";
import { PiTextAaBold } from "react-icons/pi";

import { Route, Routes } from "react-router-dom";
import {
  CreateRepositoryButton,
  CreateRepositoryModal,
  RepositoryList,
} from "./repos-comp";
import { users } from "../../lib/api/interface/index";
import { ActivepageContext } from "../../lib/hooks/conf";
import { activepage } from "../../lib/hooks/interface";
type Order = "asc" | "desc";
type SortBy = "name" | "created_at";
const RepositoryPage = React.lazy(() => import("./repository"));

dayjs.extend(relativeTime);

const RepositoriesPage = () => {
  const router = useRouter();
  const [showCreateRepositoryModal, setShowCreateRepositoryModal] =
    useState(false);
  const [sampleRepoChecked, setSampleRepoChecked] = useState(false);
  const [createRepoError, setCreateRepoError] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [creatingRepo, setCreatingRepo] = useState(false);
  const [repoamount, setRepoAmount] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [order, setOrder] = useState<Order>("asc");
  function debounce(func: Function, delay: number) {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value);
  };
  const debouncedHandleChange = debounce(handleChange, 300);

  useEffect(() => {
    if (!cache.get("token")) {
      router.push("/login");
    }
  });
  const activepageL: activepage = useContext(ActivepageContext);
  useEffect(() => {
    activepageL.setPage("repositories");
  });
  const createRepo = async (
    repo: {
      name: string;
      description: string;
      visible: boolean;
      blockstore_config: string;
    },
    presentRepo = true
  ) => {
    const owner = cache.get("user");
    try {
      setCreatingRepo(true);
      setCreateRepoError(null);
      await users.createRepository(repo);
      setRefresh(!refresh);
      if (presentRepo) {
        router.push({
          pathname: `/repositories/:user/:repoId/objects`,
          params: { repoId: repo.name, user: owner },
          query: {},
        });
      }
      return true;
    } catch (error: any) {
      setCreatingRepo(false);
      setCreateRepoError(error);
      return false;
    }
  };
  useEffect(() => {
    let filter = router.query.filter;
    setFilter(filter ? filter : "");
  }, [router]);

  const createRepositoryButtonCallback = useCallback(() => {
    setSampleRepoChecked(false);
    setShowCreateRepositoryModal(true);
    setCreateRepoError(null);
  }, [showCreateRepositoryModal, setShowCreateRepositoryModal]);

  return (
    <Layout>
      <Container fluid="xl" className="mt-3">
        {
          <ActionsBar>
            <h2 className="repoTittle">
              <strong>{filter ? filter : "All"}</strong>
            </h2>
            <ButtonToolbar className="ms-auto mb-2">
              <CreateRepositoryButton
                variant="primary"
                enabled={true}
                onClick={createRepositoryButtonCallback}
              />
            </ButtonToolbar>
          </ActionsBar>
        }
        <Form>
          <FormControl
            type="text"
            placeholder="Search"
            className="mr-sm-2"
            onChange={debouncedHandleChange}
          />
        </Form>

        <Card className="repo-card">
          <Card.Header className="repo-card-header">
            <strong>{repoamount} repositories</strong>
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-primary"
                className="sortType"
                id="dropdown-basic"
              >
                {order == "asc" ? <HiSortAscending /> : <PiSortAscendingBold />}
                {sortBy == "name" ? "Name" : "Last Pushed"}
              </Dropdown.Toggle>
              <Dropdown.Menu className="sortMenu">
                <Dropdown.Item onClick={() => setSortBy("name")}>
                  <PiTextAaBold />
                  Name
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setSortBy("created_at")}
                  className="UpsplitDropdown"
                >
                  <GoRepoPush />
                  Last Pushed
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setOrder("asc")}
                  className="DownsplitDropdown"
                >
                  <HiSortAscending />
                  Ascending
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setOrder("desc")}>
                  <PiSortAscendingBold />
                  Descending
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Card.Header>
          <RepositoryList
            refresh={refresh}
            setRepoAmount={setRepoAmount}
            search={search}
            filter={filter}
            sortBy={sortBy}
            order={order}
          />
        </Card>

        <CreateRepositoryModal
          onCancel={() => {
            setShowCreateRepositoryModal(false);
            setCreateRepoError(null);
          }}
          show={showCreateRepositoryModal}
          setShow={setShowCreateRepositoryModal}
          error={createRepoError}
          setRefresh={setRefresh}
          onSubmit={(repo) => createRepo(repo, true)}
          samlpleRepoChecked={sampleRepoChecked}
          inProgress={creatingRepo}
          refresh={refresh}
        />
      </Container>
    </Layout>
  );
};

const RepositoriesIndex = () => {
  return (
    <Routes>
      <Route path="/" element={<RepositoriesPage />} />
      <Route path=":user/:repoId/*" element={<RepositoryPage />} />
    </Routes>
  );
};

export default RepositoriesIndex;
