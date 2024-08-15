import { Branch, RefType, Repository } from "../../../../lib/api/interface/index";

export interface Ref extends Branch{
    type:RefType.Branch;
}
export interface RendererComponent {
    repo: Repository ;
    branch: Ref ;
    path: string;
    fileExtension: string | null;
    contentType: string | null;
    sizeBytes: number;
    presign?: boolean;
}

export interface RendererComponentWithText extends RendererComponent{
    text: string;
}

export interface RendererComponentWithTextCallback extends RendererComponent {
    onReady: (text: string) => JSX.Element;
}

export enum FileType {
    DATA,
    MARKDOWN,
    IPYNB,
    IMAGE,
    PDF,
    TEXT,
    UNSUPPORTED,
    TOO_LARGE,
    JS
}