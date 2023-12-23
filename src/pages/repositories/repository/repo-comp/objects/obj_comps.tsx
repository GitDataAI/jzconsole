import React, { useCallback,useState } from "react";
import dayjs from "dayjs";
import {
    AlertError,
    Loading,
} from "../../../../../lib/components/controls";
import {Alert, Button, OverlayTrigger, Tooltip} from "react-bootstrap";

import {Tree} from "../../../../../lib/components/repository/tree";
import {objects, retention, repositories, NotFoundError} from "../../../../../lib/api";
import {useAPI, useAPIWithPagination} from "../../../../../lib/hooks/api";
import { getContentType, getFileExtension, FileContents } from "./objectViewer";
import { BsCloudArrowUp } from "react-icons/bs";
import { ImportButtonProps, NoGCRulesWarningProps, ReadmeContainerProps, TreeContainerProps } from "../../../interface/repo_interface";

const README_FILE_NAME = "README.md";
const REPOSITORY_AGE_BEFORE_GC = 14;


export const TreeContainer:React.FC<TreeContainerProps> = ({
  config,
  repo,
  reference,
  path,
  after,
  onPaginate,
  onRefresh,
  onUpload,
  onImport,
  refreshToken,
}) => {
  // const { results, error, loading, nextPage } = useAPIWithPagination(() => {
  //   return objects.getEntriesInRef(
  //     repo.Name,
  //     ref,
  //     path,
  //     RefType
  //     );
  // }, [repo.id, reference.id, path, after, refreshToken]);
  const type = 'branch'
  const {response,loading,error} = useAPI(async()=>await objects.getEntriesInRef(repo.OwnerID,repo.Name,type))
  const initialState = {
    inProgress: false,
    error: null,
    done: false,
  };
  const [deleteState, setDeleteState] = useState(initialState);

    if (loading) return <Loading/>;
    if (error) return <AlertError error={error}/>;

    return (
        <>
            {deleteState.error && <AlertError error={deleteState.error} onDismiss={() => setDeleteState(initialState)}/>}
            <Tree
                config={{config}}
                repo={repo}
                reference={reference}
                path={(path) ? path : ""}
                showActions={true}
                results={results}
                after={after}
                nextPage={nextPage}
                onPaginate={onPaginate}
                onUpload={onUpload}
                onImport={onImport}
                onDelete={(entry: { path: string }) => {
                    objects
                        .delete(repo.id, reference.id, entry.path)
                        .catch(error => {
                            setDeleteState({...initialState, error: error})
                            throw error
                        })
                        .then(onRefresh)
                }}
            /></>
    );
}

export const ReadmeContainer = ({
  repo,
  reference,
  path = "",
  refreshDep = "",
}) => {
  let readmePath = "";

  if (path) {
    readmePath = path.endsWith("/")
      ? `${path}${README_FILE_NAME}`
      : `${path}/${README_FILE_NAME}`;
  } else {
    readmePath = README_FILE_NAME;
  }
  const { response, error, loading } = useAPI(
    () => objects.head(repo.id, reference.id, readmePath),
    [path, refreshDep]
  );

  if (loading || error) {
    return <></>; // no file found.
  }

  const fileExtension = getFileExtension(readmePath);
  const contentType = getContentType(response?.headers);

    return (
        <FileContents 
            repoId={repo.id} 
            reference={reference}
            path={readmePath}
            fileExtension={fileExtension}
            contentType={contentType}
            error={error}
            loading={loading}
            showFullNavigator={false}
            presign={true}
        />
    );
}

export const NoGCRulesWarning: React.FC<NoGCRulesWarningProps> = ({ repoId }) => {
  console.log('warn',repoId);
  
  const storageKey = `show_gc_warning_${repoId}`;
  const [show, setShow] = useState(
    window.localStorage.getItem(storageKey) !== "false"
  );
  const closeAndRemember = useCallback(() => {
    window.localStorage.setItem(storageKey, "false");
    setShow(false);
  }, [repoId]);

  const { response } = useAPI(async () => {
    const repo = await repositories.getRepository(repoId);
    if (
      !repo.storage_namespace.startsWith("s3:") &&
      !repo.storage_namespace.startsWith("http")
    ) {
      return false;
    }
    const createdAgo = dayjs().diff(dayjs.unix(repo.creation_date), "days");
    if (createdAgo > REPOSITORY_AGE_BEFORE_GC) {
      try {
        await retention.getGCPolicy(repoId);
      } catch (e) {
        if (e instanceof NotFoundError) {
          return true;
        }
      }
    }
    return false;
  }, [repoId]);

  if (show && response) {
    return (
      <Alert variant="warning" onClose={closeAndRemember} dismissible>
        <strong>Warning</strong>: No garbage collection rules configured for
        this repository.{" "}
        <a
          href="https://docs.pando.network"
          target="_blank"
          rel="noreferrer"
        >
          Learn More
        </a>
        .
      </Alert>
    );
  }
  return <></>;
};

