import React from "react";
// @ts-ignore
import counterpart from "counterpart";
// @ts-ignore
import {Form, InputNumber, Tooltip, Icon} from "bitshares-ui-style-guide";

interface Props {
    form: any;
    amount: number;
    minAmount: number;
    onChange: (amount: number) => void;
}

export default function AmountField({
    form,
    amount,
    minAmount,
    onChange
}: Props) {
    const {getFieldDecorator} = form;

    function onChangeHandler(amount: number) {
        onChange(amount);
    }

    const label = <>{counterpart.translate("deposit.form.amount.label")}</>;

    return (
        <Form.Item label={label}>
            {getFieldDecorator("amount", {
                initialValue: amount,
                rules: [
                    {
                        required: true,
                        message: "Please fill deposit amount!"
                    }
                ]
            })(
                <InputNumber
                    min={minAmount}
                    step={0.01}
                    onChange={onChangeHandler}
                />
            )}
            <span className="ant-form-text">ETH</span>
        </Form.Item>
    );
}
