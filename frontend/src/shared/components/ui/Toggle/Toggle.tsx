import React from "react";

export function Toggle({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <label className="toggle-switch">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
            />
            <span className="toggle-slider" />
        </label>
    );
}