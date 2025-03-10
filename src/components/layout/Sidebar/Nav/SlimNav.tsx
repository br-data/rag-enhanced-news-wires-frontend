import React, { ComponentClass } from "react";
import {
  styled,
  classNamesFunction,
} from "@fluentui/react";
import { IStyleSetBase } from "@fluentui/merge-styles";

import { getStyles } from "./Nav.styles";
import { LinkProps, NavBase, NavBaseProps, NavBaseState } from "./NavBase";
import { NavLink } from "./NavLink";

const getClassNames = classNamesFunction();

class SlimNavComponent extends NavBase {
  // store the previous floating nav shown to close when the current floating nav shows up.
  _prevFloatingNav: { removeAttribute: (arg0: string) => void } | undefined;
  state: NavBaseState;

  constructor(props: NavBaseProps) {
    super(props);

    this.state = {
      isLinkExpandStateChanged: false,
      selectedKey: props.initialSelectedKey || props.selectedKey,
    };
  }

  render() {
    const { groups } = this.props;

    if (!groups?.length) {
      return null;
    }

    // reset the flag
    // on render link, find if there is at least one hidden link to display "Show more" link
    this._hasAtleastOneHiddenLink = false;

    return (
      <>
        {groups.map((group: any, groupIndex: any) => {
          return this._renderGroup(group, groupIndex);
        })}
      </>
    );
  }

  _onLinkClicked(
    link: LinkProps,
    ev: { preventDefault: () => void; stopPropagation: () => void },
  ) {
    // set selected node
    const nextState = { selectedKey: link.key };
    this.setState(nextState);

    const hasChildren = link.links?.length;

    // if there is no children and onClick handler is defined, call it
    if (!hasChildren && link.onClick) {
      // if there is a onClick defined, call it
      link.onClick(ev, link);
    }

    // prevent url action on anchor tag if the node has a children or if the onClick handler is defined
    // if (hasChildren || link.onClick) {
    if (hasChildren) {
      ev.preventDefault();
    }
    ev.stopPropagation();
  }

  _onLinkMouseEnterOrLeave(
    link: LinkProps,
    ev: { preventDefault: () => void; stopPropagation: () => void },
  ) {
    ev.preventDefault();
    ev.stopPropagation();
    link.scrollTop = false;
    this.setState({ isLinkExpandStateChanged: true });
  }

  _getFloatingNav(parentElement: { querySelector: (arg0: string) => any }) {
    return parentElement && parentElement.querySelector("[data-floating-nav]");
  }

  _onKeyDown(link: any, ev: any) {
    const nativeEvent = ev;
    if (nativeEvent.keyCode !== 13) {
      // accept only enter key to open the floating nav from slim nav
      return;
    }

    const a = nativeEvent.target;
    const li = a.parentElement;
    const currentFloatingNav = this._getFloatingNav(li);

    if (!currentFloatingNav) {
      return;
    }

    if (this._prevFloatingNav === currentFloatingNav) {
      // toggle the floating nav
      if (currentFloatingNav?.style?.display === "block") {
        currentFloatingNav.removeAttribute("style");
      } else {
        currentFloatingNav.setAttribute("style", "display: block");
      }
    } else {
      // prev and current floating navs are different
      // close the previous if there is one
      if (this._prevFloatingNav) {
        this._prevFloatingNav.removeAttribute("style");
      }

      // open the current one
      currentFloatingNav.setAttribute("style", "display: block");

      // store the current as prev
      this._prevFloatingNav = currentFloatingNav;
    }
  }

  _renderCompositeLink(link: LinkProps, linkIndex: any, nestingLevel: number) {
    const { styles, showMore, onShowMoreLinkClicked, theme } = this.props;

    if (!link) {
      return null;
    }

    let rightIconName = undefined;
    if (link.url && link.target === "_blank") {
      // for external links, show an icon
      rightIconName = "OpenInNewWindow";
    }

    const isSelected =
      nestingLevel > 0 &&
      this.isLinkSelected(link, false /* includeChildren */);
    const classNames: IStyleSetBase = getClassNames(styles, {
      isSelected,
      nestingLevel,
      theme: theme,
    });
    const linkText = this.getLinkText(link, showMore);
    const onClickHandler =
      link.isShowMoreLink && onShowMoreLinkClicked
        ? onShowMoreLinkClicked
        : this._onLinkClicked.bind(this, link);

    return (
      <NavLink
        id={link.key}
        content={linkText}
        href={link.url!}
        target={link.target}
        dataValue={link.key}
        ariaLabel={linkText}
        role="menu"
        onClick={onClickHandler}
        rootClassName={classNames.navFloatingItemRoot}
        rightIconName={rightIconName}
        textClassName={classNames.navItemNameColumn}
        iconClassName={classNames.navItemIconColumn}
        barClassName={classNames.navItemBarMarker}
        focusedStyle={classNames.focusedStyle}
      />
    );
  }

  _renderFloatingLink(link: LinkProps, linkIndex: any, nestingLevel: number) {
    const { showMore } = this.props;

    if (!link) {
      return null;
    }

    const linkText = this.getLinkText(link, showMore);

    return (
      <li key={link.key || linkIndex} title={linkText}>
        {this._renderCompositeLink(link, linkIndex, nestingLevel)}
        {
          // show child links
          // 1. only for the first level
          nestingLevel === 0 ? (
            <div>{this._renderFloatingLinks(link.links, ++nestingLevel)}</div>
          ) : null
        }
      </li>
    );
  }

  _renderFloatingLinks(links: LinkProps[], nestingLevel: number) {
    if (!links?.length) {
      return null;
    }

    return (
      <ul>
        {links.map((link: LinkProps, linkIndex: any) => {
          return this._renderFloatingLink(link, linkIndex, nestingLevel);
        })}
      </ul>
    );
  }

  _renderFloatingNav(link: LinkProps, _linkIndex: any) {
    const { styles, theme } = this.props;

    if (!link) {
      return null;
    }

    const hasChildren = link.links?.length;
    const classNames: IStyleSetBase = getClassNames(styles, {
      hasChildren,
      scrollTop: link.scrollTop,
      theme: theme,
    });

    return (
      <div className={classNames.navFloatingRoot} data-floating-nav>
        {this._renderFloatingLinks([link], 0 /* nestingLevel */)}
      </div>
    );
  }

  _renderLink(link: LinkProps, linkIndex: any, _nestingLevel: any) {
    const { styles, showMore, onShowMoreLinkClicked, theme } = this.props;

    if (!link) {
      return null;
    }

    const isSelected = this.isLinkSelected(link, true /* includeChildren */);
    const hasChildren = link.links?.length;
    const classNames: IStyleSetBase = getClassNames(styles, {
      isSelected,
      hasChildren,

      theme: theme,
    });
    const linkText = this.getLinkText(link, showMore);
    const onClickHandler =
      link.isShowMoreLink && onShowMoreLinkClicked
        ? onShowMoreLinkClicked
        : this._onLinkClicked.bind(this, link);

    return (
      <li
        key={link.key || linkIndex}
        onMouseEnter={this._onLinkMouseEnterOrLeave.bind(this, link)}
        onMouseLeave={this._onLinkMouseEnterOrLeave.bind(this, link)}
        onKeyDown={this._onKeyDown.bind(this, link)}
        title={linkText}
        className={classNames.navSlimItemRoot}
      >
        <NavLink
          id={link.key}
          href={link.url!}
          target={link.target}
          dataValue={link.key}
          ariaLabel={linkText}
          role="menu"
          onClick={onClickHandler}
          rootClassName={classNames.navItemRoot}
          leftIconName={link.icon}
          iconClassName={classNames.navItemIconColumn}
          barClassName={classNames.navItemBarMarker}
          focusedStyle={classNames.focusedStyle}
        />
        {this._renderFloatingNav(link, linkIndex)}
      </li>
    );
  }

  _renderLinks(links: any[], nestingLevel: number) {
    const { showMore } = this.props;

    if (!links?.length) {
      return null;
    }

    return (
      <ul>
        {links.map((link: LinkProps, linkIndex: any) => {
          if (link.isHidden && !showMore) {
            // atleast one link is hidden
            this._hasAtleastOneHiddenLink = true;

            // "Show more" overrides isHidden property
            return null;
          } else if (
            link.isShowMoreLink &&
            !this._hasAtleastOneHiddenLink &&
            !showMore
          ) {
            // there is no hidden link, hide "Show more" link
            return null;
          } else {
            return this._renderLink(link, linkIndex, nestingLevel);
          }
        })}
      </ul>
    );
  }

  _renderGroup(group: { links: any[] }, groupIndex: number) {
    const { styles, theme } = this.props;

    if (!group?.links?.length) {
      return null;
    }

    const classNames: IStyleSetBase = getClassNames(styles, { theme: theme });

    let isGroupHeaderVisible = false;

    // first group header is hidden by default, display group header for other groups only if there are visible links
    if (groupIndex > 0) {
      isGroupHeaderVisible = this.hasAtleastOneVisibleLink(
        group.links,
        this.props.showMore,
      ) as boolean;
    }

    return (
      <div key={groupIndex}>
        {
          // do not render group header for the first group
          isGroupHeaderVisible ? (
            <div className={classNames.navGroupSeparatorRoot}>
              <div className={classNames.navGroupSeparatorHrLine} />
            </div>
          ) : null
        }
        {this._renderLinks(group.links, 0 /* nestingLevel */)}
      </div>
    );
  }
}

export const SlimNav = styled(
  SlimNavComponent as ComponentClass<any>,
  getStyles,
);
