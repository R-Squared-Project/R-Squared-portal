import React, {useEffect, useState} from "react";
// @ts-ignore
import Translate from "react-translate-component";

type Params = {
    content: (currentAddress: string, addresses: string[]) => JSX.Element;
};

function ExternalWalletButton({content}: Params) {
    const [installed, setInstalled] = useState(true);
    const [connected, setConnected] = useState(false);
    const [currentAddress, setCurrentAddress] = useState("");
    const [addresses, setAddresses] = useState<string[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        async function isConnected() {
            if (window.ethereum === undefined) {
                setInstalled(false);
                return;
            }

            let accounts: string[] | undefined = undefined;
            try {
                setError("");
                accounts = (await window.ethereum.request<string[]>({
                    method: "eth_requestAccounts"
                })) as string[];
            } catch (e) {
                setError("metamask.unlock_account");
            }

            if (
                accounts === null ||
                accounts === undefined ||
                accounts.length === 0
            ) {
                setConnected(false);
                return;
            }

            setConnected(true);

            setAddresses(accounts);
            setCurrentAddress(accounts[0] as string);
        }

        isConnected();
    }, []);

    async function connect() {
        let accounts: string[] | undefined = undefined;
        try {
            setError("");
            accounts = (await window.ethereum.request<string[]>({
                method: "eth_requestAccounts"
            })) as string[];
        } catch (e) {
            setError("metamask.unlock_account");
        }

        if (
            accounts === null ||
            accounts === undefined ||
            accounts.length === 0
        ) {
            setConnected(false);
            return;
        }

        setConnected(true);
        setCurrentAddress(accounts[0] as string);
    }

    if (!installed) {
        return <Translate content="metamask.not_installed" />;
    }

    if (!connected) {
        return (
            <>
                <Translate content="metamask.not_connected" component="p" />
                {error && (
                    <Translate
                        content={error}
                        className={"warning-message"}
                        component="p"
                    />
                )}
                <a className="button" onClick={connect}>
                    <Translate content="metamask.connect" />
                </a>
            </>
        );
    }

    return content(currentAddress, addresses);
}

export default ExternalWalletButton;
