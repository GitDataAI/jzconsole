import React, {useState} from "react";
import {Link} from "../nav";
import {
    ChevronDownIcon,
    ChevronRightIcon, CircleSlashIcon,
    ClockIcon,
    FileDirectoryIcon,
    HistoryIcon, PencilIcon, FileIcon, TableIcon, TrashIcon
} from "@primer/octicons-react";
import ChangeSummary from "./ChangeSummary";
import {ConfirmationModal} from "../modals";
import {OverlayTrigger} from "react-bootstrap";
import Tooltip from "react-bootstrap/Tooltip";
import Button from "react-bootstrap/Button";
import {TreeRowType} from "../../../constants";
import { ObjectTreeEntryRowProps, PrefixExpansionSectionProps, PrefixTreeEntryRowProps, TableRowProps, TableTreeEntryRowProps } from "../interface/comp_interface";
import { Entry } from "../../../util/otfUtil";

export class RowAction {
    /**
     * @param {JSX.Element} icon
     * @param {string} tooltip
     * @param {string} text
     * @param {()=>void} onClick
     */
    icon: JSX.Element | null;
    tooltip: string | null;
    text: string | null;
    onClick: () => void;
    constructor(icon:JSX.Element | null, tooltip:string | null= "", text: string | null, onClick:()=>void) {
        this.icon = icon
        this.tooltip = tooltip
        this.text = text
        this.onClick = onClick
    }
}

/**
 * @param {[RowAction]} actions
 */
const ChangeRowActions = ({actions}:{actions:RowAction[]}) => <>
    {
        actions.map(action => (
            <><OverlayTrigger placement="bottom" overlay={<Tooltip hidden={!action.tooltip}>{action.tooltip}</Tooltip>}>
                <Button variant="link" disabled={false}
                        onClick={(e) => {
                            e.preventDefault();
                            action.onClick()
                        }}>
                    {action.icon
                        ? action.icon
                        : action.text}
                </Button>
            </OverlayTrigger>&#160;&#160;</>
        ))}
</>

export const ObjectTreeEntryRow:React.FC<ObjectTreeEntryRowProps> = ({entry, relativeTo = "", diffExpanded, depth = 0, loading = false, onRevert, onClickExpandDiff = null}) => {
    const [showRevertConfirm, setShowRevertConfirm] = useState(false)
    let rowClass = 'tree-entry-row ' + diffType(entry);
    let pathSection = extractPathText(entry, relativeTo);
    const diffIndicator = <DiffIndicationIcon entry={entry} rowType={TreeRowType.Object}/>;

    const rowActions = []
    if (onClickExpandDiff) {
        rowActions.push(new RowAction(null, null, diffExpanded ? "Hide object changes" : "Show object changes", onClickExpandDiff))
    }
    if (onRevert) {
        rowActions.push(new RowAction(<HistoryIcon/>, "Revert changes", null, () => {
            setShowRevertConfirm(true)
        }))
    }
    return (
        <TableRow className={rowClass} entry={entry} diffIndicator={diffIndicator} rowActions={rowActions}
        onRevert={onRevert} depth={depth} loading={loading} pathSection={pathSection}
        showRevertConfirm={showRevertConfirm} setShowRevertConfirm={() => setShowRevertConfirm(false)} showSummary={undefined} getMore={undefined} dirExpanded={undefined} onExpand={undefined}/>
    );
};

export const PrefixTreeEntryRow:React.FC<PrefixTreeEntryRowProps> = ({entry, relativeTo = "", dirExpanded, depth = 0, onClick, loading = false, onRevert, onNavigate, getMore}) => {
    const [showRevertConfirm, setShowRevertConfirm] = useState(false)
    let rowClass = 'tree-entry-row ' + diffType(entry);
    let pathSection: JSX.Element | string = extractPathText(entry, relativeTo);
    let diffIndicator = <DiffIndicationIcon entry={entry} rowType={TreeRowType.Prefix}/>;
    const [showSummary, setShowSummary] = useState(false);
    if (entry.path_type === "common_prefix") {
        pathSection = <Link href={onNavigate(entry)}>{pathSection}</Link>
    }
    const rowActions = []
    rowActions.push(new RowAction(null, null, showSummary ? "Hide change summary" : "Calculate change summary", () => setShowSummary(!showSummary)))
    if (onRevert) {
        rowActions.push(new RowAction(<HistoryIcon/>, "Revert changes", null, () => {
            setShowRevertConfirm(true)
        }))
    }

    return (
        <TableRow className={rowClass} entry={entry} diffIndicator={diffIndicator} getMore={getMore} rowActions={rowActions}
                  onRevert={onRevert} depth={depth} loading={loading} pathSection={pathSection} showSummary={showSummary}
                  dirExpanded={dirExpanded} onExpand={onClick}
                  showRevertConfirm={showRevertConfirm} setShowRevertConfirm={() => setShowRevertConfirm(false)}
        />
    );
};

export const TableTreeEntryRow:React.FC<TableTreeEntryRowProps> = ({entry, relativeTo = "", onClickExpandDiff, depth = 0, loading = false, onRevert}) => {
    const [showRevertConfirm, setShowRevertConfirm] = useState(false)
    let rowClass = 'tree-entry-row ' + diffType(entry);
    let pathSection = extractTableName(entry, relativeTo);
    const diffIndicator = <DiffIndicationIcon entry={entry} rowType={TreeRowType.Table}/>

    const rowActions = []
    rowActions.push(new RowAction(null, "", "Show table changes", onClickExpandDiff))
    if (onRevert) {
        rowActions.push(new RowAction(<HistoryIcon/>, "Revert changes", null, () => {
            setShowRevertConfirm(true)
        }))
    }
    return (
        <TableRow className={rowClass} entry={entry} diffIndicator={diffIndicator} rowActions={rowActions}
                  onRevert={onRevert} depth={depth} loading={loading} pathSection={pathSection}
                  showRevertConfirm={showRevertConfirm} setShowRevertConfirm={() => setShowRevertConfirm(false)}/>
    );
};

const PrefixExpansionSection = ({dirExpanded, onClick}:PrefixExpansionSectionProps) => {
    return (<span onClick={onClick}>
                {dirExpanded ? <ChevronDownIcon/> : <ChevronRightIcon/>}
            </span>)
}

const TableRow:React.FC<TableRowProps> = ({className,diffIndicator, depth, loading, showSummary, entry, getMore, rowActions,
                      showRevertConfirm, setShowRevertConfirm, pathSection, onRevert, dirExpanded, onExpand, ...rest}) => {
    return (<tr {...rest} className={className}>
            <td className="entry-type-indicator">{diffIndicator}</td>
            <td className="tree-path">
                        <span style={{marginLeft: (depth * 20) + "px"}}>
                            {pathSection}
                            {onExpand && <PrefixExpansionSection dirExpanded={dirExpanded? dirExpanded: false } onClick={onExpand}/>}
                            {loading ? <ClockIcon/> : ""}
                        </span>
            </td>
            <td className={"change-summary"}>{showSummary && <ChangeSummary prefix={entry.path} getMore={getMore}/>}</td>
            <td className={"change-entry-row-actions"}>
                <ChangeRowActions actions={rowActions} />
                <ConfirmationModal show={showRevertConfirm} onHide={setShowRevertConfirm}
                                   msg={`Are you sure you wish to revert "${entry.path}" (${entry.type})?`}
                                   onConfirm={ onRevert? () => onRevert(entry) : undefined}/>
            </td> 
        </tr>
    )
}

function extractPathText(entry:Entry, relativeTo:string) {
    console.log('entry:',entry);

    let pathText = entry.to_hash? entry.to_hash:entry.base_hash;
    if (pathText.startsWith(relativeTo)) {
        pathText = pathText.substr(relativeTo.length);
    }
    return pathText;
}

function diffType(entry:Entry) {
    switch (entry.action) {
        case '1':
            return 'diff-added';
        case '2':
            return 'diff-changed';
        case '3':
            return 'diff-removed';
        default:
            return '';
    }
}

function extractTableName(entry:Entry, relativeTo:string) {
    
    let pathText:string = entry.to_hash;
    if (pathText.startsWith(relativeTo)) {
        pathText = pathText.substr(relativeTo.length);
    }
    if (pathText.endsWith("/")) {
        pathText = pathText.slice(0,-1)
    }
    return pathText;
}

export const DiffIndicationIcon = ({entry, rowType}:{entry:Entry, rowType:number}) => {
    let diffIcon;
    let tooltipId;
    let tooltipText;
    if (rowType === TreeRowType.Prefix) {
        diffIcon = <FileDirectoryIcon/>;
        tooltipId = "tooltip-prefix";
        tooltipText = "Changes under prefix";
    } else if (rowType === TreeRowType.Table) {
        diffIcon = <TableIcon/>;
        tooltipId = "tooltip-table";
        tooltipText = "Table changed"
    } else {
        switch (entry.action) {
            case '1':
                diffIcon = <TrashIcon/>;
                tooltipId = "tooltip-removed";
                tooltipText = "Removed";
                break;
            case '2':
                diffIcon = <FileIcon/>;
                tooltipId = "tooltip-added";
                tooltipText = "Added";
                break;
            case '3':
                diffIcon = <PencilIcon/>;
                tooltipId = "tooltip-changed";
                tooltipText = "Changed";
                break;
            default:
        }
    }

    return <OverlayTrigger placement="bottom" overlay={(<Tooltip id={tooltipId}>{tooltipText}</Tooltip>)}>
                <span>
                    {diffIcon}
                </span>
    </OverlayTrigger>;
}
