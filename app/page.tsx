"use client";

import React, { useState } from "react";
import { Globe, LogIn, Moon, Sun } from "lucide-react";
import {currencies} from "@/constants";


export default function CurrencyConverter() {
    const [lightTheme, setLightTheme] = useState(true);
    const [amount, setAmount] = useState(1);
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("INR");
    const [convertedAmount, setConvertedAmount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const toggleTheme = () => setLightTheme(!lightTheme);

    const convertCurrency = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setConvertedAmount(null);

        if (fromCurrency === toCurrency) {
            setConvertedAmount(amount);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `https://api.exchangerate.host/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && typeof data.result === "number") {
                setConvertedAmount(data.result);
            } else {
                const fallbackResponse = await fetch(
                    `https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}`
                );

                if (!fallbackResponse.ok) {
                    throw new Error("Both API endpoints failed");
                }

                const fallbackData = await fallbackResponse.json();

                if (fallbackData.success && fallbackData.rates && fallbackData.rates[toCurrency]) {
                    const rate = fallbackData.rates[toCurrency];
                    setConvertedAmount(amount * rate);
                } else {
                    throw new Error("Unable to get exchange rate");
                }
            }
        } catch (error) {
            console.error("Conversion error:", error);

            const mockRates = {
                USD: { INR: 83.25, EUR: 0.85, GBP: 0.73, JPY: 110.0 },
                EUR: { USD: 1.18, INR: 98.1, GBP: 0.86, JPY: 129.5 },
                GBP: { USD: 1.37, EUR: 1.16, INR: 114.0, JPY: 150.8 },
                INR: { USD: 0.012, EUR: 0.010, GBP: 0.0088, JPY: 1.32 },
                JPY: { USD: 0.0091, EUR: 0.0077, GBP: 0.0066, INR: 0.76 }
            };

            if (mockRates[fromCurrency] && mockRates[fromCurrency][toCurrency]) {
                const rate = mockRates[fromCurrency][toCurrency];
                setConvertedAmount(amount * rate);
                setErrorMessage("Using offline rates (API temporarily unavailable)");
            } else {
                setErrorMessage("Conversion failed. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={lightTheme ? "main px-[20%]" : "main-dark px-[20%]"}>
            <div className={lightTheme ? "container" : "container-dark"}>
                <div className={lightTheme ? "navbar" : "navbar-dark"}>
                    <div className="flex justify-center items-center gap-2">
                        <Globe size={30} />
                        <h1 className={lightTheme ? "text-black font-bold text-2xl" : "text-white font-bold text-2xl"}>
                            GlobeX
                        </h1>
                    </div>
                    <div className="flex justify-center items-center gap-3">
                        <button className={lightTheme ? "button" : "button-dark"}>
                            login
                            <LogIn size={25} />
                        </button>
                        <button onClick={toggleTheme}>
                            {lightTheme ? <Sun size={30} /> : <Moon size={30} />}
                        </button>
                    </div>
                </div>

                <hr className="text-gray-200 my-5" />
                <div className="px-[20%]">
                    <h1 className={lightTheme ? "heading" : "heading-dark"}>Currency Converter</h1>
                    <div className={lightTheme ? "main-container" : "main-container-dark"}>
                        <div className="space-y-3.5">
                            <div className="flex justify-center items-center">
                                <input
                                    placeholder="Amount"
                                    className={`${lightTheme ? "amount-holder" : "amount-holder-dark"} py-2 w-full text-center`}
                                    step="0.001"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        setAmount(!isNaN(value) && value > 0 ? value : 1);
                                    }}
                                />
                            </div>

                            <div className="flex justify-evenly items-center">
                                <select
                                    className={`${lightTheme ? "curr-selector" : "curr-selector-dark"} ${lightTheme ? "text-black bg-white" : "text-white bg-[#2c2c2c]"}`}
                                    value={fromCurrency}
                                    onChange={(e) => setFromCurrency(e.target.value)}
                                >
                                    {currencies.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.title}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className={`${lightTheme ? "curr-selector" : "curr-selector-dark"} ${lightTheme ? "text-black bg-white" : "text-white bg-[#2c2c2c]"}`}
                                    value={toCurrency}
                                    onChange={(e) => setToCurrency(e.target.value)}
                                >
                                    {currencies.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-center items-center">
                                <button
                                    onClick={convertCurrency}
                                    disabled={isLoading}
                                    className={`${lightTheme ? "convert-button" : "convert-button-dark"} ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"} transition duration-150 ease-in-out`}
                                >
                                    {isLoading ? "Converting..." : "Convert"}
                                </button>
                            </div>
                        </div>

                        <hr className="text-gray-200 my-5" />

                        {errorMessage && (
                            <p className="text-red-500 text-center font-semibold">{errorMessage}</p>
                        )}

                        {typeof convertedAmount === "number" && !isNaN(convertedAmount) && (
                            <div className="mt-4 text-center">
                                <p className={`text-lg font-bold ${lightTheme ? "text-black" : "text-white"}`}>
                                    {amount} {fromCurrency} = {convertedAmount} {toCurrency}
                                </p>
                                <p className={`text-sm ${lightTheme ? "text-gray-600" : "text-gray-400"}`}>
                                    1 {fromCurrency} = {(convertedAmount / amount)} {toCurrency}
                                </p>
                            </div>
                        )}
                    </div>

                    <h1 className={lightTheme ? "bottom-text" : "bottom-text-dark"}>
                        Built by Sarvesh Hardas. API used: exchangerate.host
                    </h1>
                </div>
            </div>
        </section>
    );
}