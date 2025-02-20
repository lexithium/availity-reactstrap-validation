import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AvInput from './AvInput';
import AvGroup from './AvGroup';
import AvFeedback from './AvFeedback';
import {Col, FormText, Label, Input, CustomInput, InputGroup, InputGroupAddon, InputGroupText} from 'reactstrap';
import InputMask from 'react-input-mask';

const colSizes = ['xs', 'sm', 'md', 'lg', 'xl'];

export default class AvField extends Component {
  static propTypes = Object.assign({}, AvInput.propTypes, {
    label: PropTypes.node,
    labelHidden: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    id: PropTypes.string,
    inputClass: PropTypes.string,
    labelClass: PropTypes.string,
    helpMessage: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    errorMessage: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    labelAttrs: PropTypes.object,
    groupAttrs: PropTypes.object,
    grid: PropTypes.object,
    inputGroup: PropTypes.object,
    mask: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(RegExp)])
      )
    ]),
    maskPlaceholder: PropTypes.string,
    alwaysShowMask: PropTypes.bool
  });

  static contextTypes = {
    FormCtrl: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    FormCtrl: PropTypes.object.isRequired,
  };

  getChildContext() {
    this.FormCtrl = {...this.context.FormCtrl};
    const registerValidator = this.FormCtrl.register;
    this.FormCtrl.register = (input, updater = input && input.setState && input.setState.bind(input)) => {
      registerValidator(input, () => {
        this.setState({});
        if (updater) updater({});
      });
    };
    return {
      FormCtrl: this.FormCtrl,
    };
  }

  render() {
    let row = false;
    const col = {};
    const labelCol = {};
    const {
      helpMessage,
      label,
      labelHidden,
      inputClass,
      labelClass,
      children,
      id = this.props.name,
      size,
      disabled,
      readOnly,
      grid,
      inputGroup,
      labelAttrs,
      groupAttrs,
      ...attributes
    } = this.props;

    if (grid) {
      colSizes.forEach(colSize => {
        if (grid[colSize]) {
          row = true;
          const sizeNum = parseInt(grid[colSize], 10);
          col[colSize] = sizeNum;
          labelCol[colSize] = 12 - sizeNum;
        }
      });
    }

    const input = (<AvInput
        id={id}
        className={inputClass}
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        tag={this.props.mask ? InputMask : Input}
        {...attributes}
      >
        {children}
      </AvInput>);

    const validation = this.context.FormCtrl.getInputState(this.props.name);

    const feedback = validation.errorMessage ? (<AvFeedback>{validation.errorMessage}</AvFeedback>) : null;
    const help = helpMessage ? (<FormText>{helpMessage}</FormText>) : null;
    const inputRow = row ? <Col {...col}>{input}{feedback}{help}</Col> : (inputGroup ? <InputGroup>{input} <InputGroupAddon onClick={inputGroup.onClick} addonType={inputGroup.addonType} {...inputGroup.props}><InputGroupText>{inputGroup.text}</InputGroupText></InputGroupAddon>{feedback}</InputGroup> : input);
    const check = attributes.type === 'checkbox';

    if (
      (check || attributes.type === "radio" || attributes.type === "switch") &&
      (attributes.tag === CustomInput ||
        (Array.isArray(attributes.tag) && attributes.tag[0] === CustomInput))
    ) {
      return <AvGroup className="mb-0"><AvInput {...this.props}>{feedback}{help}</AvInput></AvGroup>;
    }

    return (
      <AvGroup check={check} disabled={disabled} row={row} {...groupAttrs}>
        {check && inputRow}
        {label && <Label
          for={id}
          className={labelClass}
          hidden={labelHidden}
          size={size}
          {...labelCol}
          {...labelAttrs}
        >
          {label}
        </Label>}
        {!check && inputRow}
        {!row && !inputGroup && feedback}
        {!row && help}
      </AvGroup>
    );
  }
}
