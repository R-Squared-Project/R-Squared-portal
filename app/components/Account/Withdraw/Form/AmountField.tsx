import React from "react";
// @ts-ignore
import counterpart from "counterpart";
// @ts-ignore
import {Form, InputNumber, Tooltip, Icon} from "bitshares-ui-style-guide";
import {ValidationRule} from "antd/lib/form/Form";

interface Props {
    form: any;
    amount: number;
    minAmount: number;
    onChange: (amount: number) => void;
    validateCallback?: (value: number) => void;
    step?: number;
}

export default function AmountField({
    form,
    amount,
    minAmount,
    onChange,
    validateCallback,
    step
}: Props) {
    const {getFieldDecorator} = form;

    if (!step) {
        step = 0.01;
    }

    function onChangeHandler(amount: number) {
        onChange(amount);
    }

    const label = <>{counterpart.translate("deposit.form.amount.label")}</>;

    const rules: ValidationRule[] = [
        {
            required: true,
            message: "Please fill deposit amount!"
        }
    ];

    if (validateCallback) {
        rules.push({
            validator: validateCallback
        });
    }

    return (
        <Form.Item label={label}>
            {getFieldDecorator("amount", {
                initialValue: amount,
                rules: rules
            })(
                <InputNumber
                    min={minAmount}
                    step={step}
                    onChange={onChangeHandler}
                />
            )}
            <span className="ant-form-text">ETH</span>
        </Form.Item>
    );
}
