import {Button,Modal,Form,Container,Row,Col,ProgressBar} from "react-bootstrap";
import React, {useCallback, useEffect, useState } from "react";
import {useDropzone} from "react-dropzone";
import {objects} from "../../../../../lib/api";
import {CheckboxIcon, UploadIcon, XIcon} from "@primer/octicons-react";
import {humanSize} from "../../../../../lib/components/repository/tree";
import pMap from "p-map";
import {
    AlertError,
    Warnings
} from "../../../../../lib/components/controls";
import { InitialState, UploadButtonProps, UploadCandidateProps, UploadFileProps, UploadResult, _File } from "../../../interface/repo_interface";

const MAX_PARALLEL_UPLOADS = 5;

const destinationPath = (path: string | undefined, file: _File) => {
    return `${path ? path : ""}${file.path.replace(/\\/g, '/').replace(/^\//, '')}`;
  };
  
  const UploadCandidate = ({ repo, path, file, state, onRemove = null }) => {
    const fpath = destinationPath(path, file)
    let uploadIndicator = null;
    if (state && state.status === "uploading") {
      uploadIndicator = <ProgressBar variant="success" now={state.percent}/>
    } else if (state && state.status === "done") {
      uploadIndicator = <strong><CheckboxIcon/></strong>
    } else if (!state && onRemove !== null) {
      uploadIndicator = (
        <a  href="#" onClick={ e => {
          e.preventDefault()
          onRemove()
        }}>
          <XIcon />
        </a>
      );
    }
    return (
      <Container>
        <Row className={`upload-item upload-item-${state ? state.status : "none"}`}>
          <Col>
            <span className="path">
              jzfs://{repo.id}/{fpath}
            </span>
          </Col>
          <Col xs md="2">
            <span className="size">
              {humanSize(file.size)}
            </span>
          </Col>
          <Col xs md="1">
            <span className="upload-state">
              {uploadIndicator ? uploadIndicator : <></>}
            </span>
          </Col>
        </Row>
      </Container>
    )
  };
  
  async function uploadFile( repository: string, branch: string, path: string, file: File, wipID: string) {
    await objects.uploadObject(repository, branch, path, file, wipID);
}

  
export const UploadButton = ({repoId, branch, path,wipID, onDone, onClick, onHide, show = false}) => {
    const initialState: InitialState = {
      inProgress: false,
      error : null,
      done: false,
    };
    const [currentPath, setCurrentPath] = useState(path);
    const [uploadState, setUploadState] = useState(initialState);
    const [files, setFiles] = useState<_File[]>([]);
    const [fileStates, setFileStates] = useState<{[key: string]: any}>({});
    const [abortController, setAbortController] = useState<AbortController | null>(null)
    const onDrop = useCallback((acceptedFiles:_File[]) => {
      setFiles([...acceptedFiles])
    }, [files])
  
    const { getRootProps, getInputProps, isDragAccept } = useDropzone({onDrop})
  
  
    const hide = () => {
      if (uploadState.inProgress) {
        if (abortController !== null) {
            abortController.abort()
        } else {
          return
        }
      }
      setUploadState(initialState);
      setFileStates({});
      setFiles([]);
      setCurrentPath(path);
      setAbortController(null)
      onHide();
    };
  
    useEffect(() => {
      setCurrentPath(path)
    }, [path])
  
    const upload = async () => {
      if (files.length < 1) {
        return
      }
  
      const abortController = new AbortController()
      setAbortController(abortController)
  
      const mapper = async (file:_File) => {
        try {
          setFileStates(next => ( {...next, [file.path]: {status: 'uploading', percent: 0}}))
          await uploadFile( repoId, branch, path, file, wipID)
          
        } catch (error: any | null) {
          setFileStates(next => ( {...next, [file.path]: {status: 'error'}}))
          setUploadState({ ...initialState, error });
          throw error;
        }
        setFileStates(next => ( {...next, [file.path]: {status: 'done'}}))
      }
  
      setUploadState({...initialState,  inProgress: true });
      try {
        await pMap(files, mapper, {
          concurrency: MAX_PARALLEL_UPLOADS,
          signal: abortController.signal
        });
        onDone();
        hide();
      } catch (error: any) {
        if (error instanceof DOMException) {
          // abort!
          onDone();
          hide();
        } else {
          setUploadState({ ...initialState, error });
        }
      }
  
  
    };
  
    const changeCurrentPath = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentPath(e.target.value)
    }, [setCurrentPath])
  
    const onRemoveCandidate = useCallback((file: _File) => {
      return () => setFiles(current => current.filter(f => f !== file))
    }, [setFiles])
  
    return (
      <>
        <Modal size="xl" show={show} onHide={hide}>
          <Modal.Header closeButton>
            <Modal.Title>Upload Object</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                if (uploadState.inProgress) return;
                e.preventDefault();
                upload();
              }}
            >

              <Form.Group controlId="path" className="mb-3">
                <Form.Text>Path</Form.Text>
                <Form.Control disabled={uploadState.inProgress} defaultValue={currentPath} onChange={changeCurrentPath}/>
              </Form.Group>
  
              <Form.Group controlId="content" className="mb-3">
                <div {...getRootProps({className: 'dropzone'})}>
                    <input {...getInputProps()} />
                    <div className={isDragAccept ? "file-drop-zone file-drop-zone-focus" : "file-drop-zone"}>
                      Drag &apos;n&apos; drop files or folders here (or click to select)
                    </div>
                </div>
                <aside className="mt-3">
                  {(files && files.length > 0) &&
                    <h5>{files.length} File{files.length > 1 ? "s":""} to upload ({humanSize(files.reduce((a,f) => a + f.size ,0))})</h5>
                  }
                  {files && files.map(file =>
                      <UploadCandidate
                        key={file.path}
                        repo={repoId}
                        file={file}
                        path={currentPath}
                        state={fileStates[file.path]}
                        onRemove={!uploadState.inProgress ? onRemoveCandidate(file) : null}
                      />
                  )}
                </aside>
              </Form.Group>
            </Form>
          {(uploadState.error) ? (<AlertError error={uploadState.error}/>) : (<></>)}
        </Modal.Body>
      <Modal.Footer>
          <Button variant="secondary" onClick={hide}>
              Cancel
          </Button>
          <Button variant="success" disabled={uploadState.inProgress || files.length < 1} onClick={() => {
              if (uploadState.inProgress) return;
              upload()
          }}>
              {(uploadState.inProgress) ? 'Uploading...' : 'Upload'}
          </Button>
      </Modal.Footer>
    </Modal>
  
      <Button
        variant={"light"}
        onClick={onClick}
        >
        <UploadIcon /> Upload Object
      </Button>
    </>
    );
  };
  