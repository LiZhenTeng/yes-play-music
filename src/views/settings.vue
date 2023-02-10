<template>

</template>
<script lang="ts" setup>
import { computed } from 'vue';
import { useIndexStore } from '@/store';
import { storeToRefs } from 'pinia';
import { changeAppearance } from '@/utils/common';

const indexStore = useIndexStore();
const { settings } = storeToRefs(indexStore);
const appearance = computed({
    get() {
        if (settings.value.appearance === undefined) return 'auto';
        return settings.value.appearance;
    },
    set(value) {
        settings.value.appearance = value;
        changeAppearance(value);
    }
})
</script>
<style lang="scss" scoped>
.settings-page {
    display: flex;
    justify-content: center;
    margin-top: 32px;
}

.container {
    margin-top: 24px;
    width: 720px;
}

h2 {
    margin-top: 48px;
    font-size: 36px;
    color: var(--color-text);
}

h3 {
    margin-top: 48px;
    padding-bottom: 12px;
    font-size: 26px;
    color: var(--color-text);
    border-bottom: 1px solid rgba(128, 128, 128, 0.18);
}

.user {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--color-secondary-bg);
    color: var(--color-text);
    padding: 16px 20px;
    border-radius: 16px;
    margin-bottom: 48px;

    img.avatar {
        border-radius: 50%;
        height: 64px;
        width: 64px;
    }

    img.cvip {
        height: 13px;
        margin-right: 4px;
    }

    .left {
        display: flex;
        align-items: center;

        .info {
            margin-left: 24px;
        }

        .nickname {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 2px;
        }

        .extra-info {
            font-size: 13px;

            .text {
                opacity: 0.68;
            }

            .vip {
                display: flex;
                align-items: center;
            }
        }
    }

    .right {
        .svg-icon {
            height: 18px;
            width: 18px;
            margin-right: 4px;
        }

        button {
            display: flex;
            align-items: center;
            font-size: 18px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 10px;
            padding: 8px 12px;
            opacity: 0.68;
            color: var(--color-text);
            transition: 0.2s;

            margin: {
                right: 12px;
                left: 12px;
            }

            &:hover {
                opacity: 1;
                background: #eaeffd;
                color: #335eea;
            }

            &:active {
                opacity: 1;
                transform: scale(0.92);
                transition: 0.2s;
            }
        }
    }
}

.item {
    margin: 24px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--color-text);

    .title {
        font-size: 16px;
        font-weight: 500;
        opacity: 0.78;
    }

    .description {
        font-size: 14px;
        margin-top: 0.5em;
        opacity: 0.7;
    }
}

select {
    min-width: 192px;
    font-weight: 600;
    border: none;
    padding: 8px 12px 8px 12px;
    border-radius: 8px;
    color: var(--color-text);
    background: var(--color-secondary-bg);
    appearance: none;

    &:focus {
        outline: none;
        color: var(--color-primary);
        background: var(--color-primary-bg);
    }
}

button {
    color: var(--color-text);
    background: var(--color-secondary-bg);
    padding: 8px 12px 8px 12px;
    font-weight: 600;
    border-radius: 8px;
    transition: 0.2s;

    &:hover {
        transform: scale(1.06);
    }

    &:active {
        transform: scale(0.94);
    }
}

input.text-input.margin-right-0 {
    margin-right: 0;
}

input.text-input {
    background: var(--color-secondary-bg);
    border: none;
    margin-right: 22px;
    padding: 8px 12px 8px 12px;
    border-radius: 8px;
    color: var(--color-text);
    font-weight: 600;
    font-size: 16px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

input[type='number'] {
    -moz-appearance: textfield;
}

#proxy-form {
    display: flex;
    align-items: center;
}

#proxy-form.disabled {
    opacity: 0.47;

    button:hover {
        transform: unset;
    }
}

#shortcut-table {
    font-size: 14px;
    /* border: 1px solid black; */
    user-select: none;
    color: var(--color-text);

    .row {
        display: flex;
    }

    .row.row-head {
        opacity: 0.58;
        font-size: 13px;
        font-weight: 500;
    }

    .col {
        min-width: 192px;
        padding: 8px;
        display: flex;
        align-items: center;

        /* border: 1px solid red; */
        &:first-of-type {
            padding-left: 0;
            min-width: 128px;
        }
    }

    .keyboard-input {
        font-weight: 600;
        background-color: var(--color-secondary-bg);
        padding: 8px 12px 8px 12px;
        border-radius: 0.5rem;
        min-width: 146px;
        min-height: 34px;
        box-sizing: border-box;

        &.active {
            color: var(--color-primary);
            background-color: var(--color-primary-bg);
        }
    }

    .restore-default-shortcut {
        margin-top: 12px;
    }

    &.global-disabled {
        .row .col:last-child {
            opacity: 0.48;
        }

        .row.row-head .col:last-child {
            opacity: 1;
        }
    }

    &:focus {
        outline: none;
    }
}

.footer {
    text-align: center;
    margin-top: 6rem;
    color: var(--color-text);
    font-weight: 600;

    .author {
        font-size: 0.9rem;
    }

    .version {
        font-size: 0.88rem;
        opacity: 0.58;
        margin-top: -10px;
    }
}

.beforeAnimation {
    -webkit-transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
    transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
}

.afterAnimation {
    box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 0px 0 hsla(0, 0%, 0%, 0.04),
        0 4px 9px hsla(0, 0%, 0%, 0.13), 0 3px 3px hsla(0, 0%, 0%, 0.05);
    -webkit-transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
    transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
}

.toggle {
    margin: auto;
}

.toggle input {
    opacity: 0;
    position: absolute;
}

.toggle input+label {
    position: relative;
    display: inline-block;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-transition: 0.4s ease;
    transition: 0.4s ease;
    height: 32px;
    width: 52px;
    background: var(--color-secondary-bg);
    border-radius: 8px;
}

.toggle input+label:before {
    content: '';
    position: absolute;
    display: block;
    -webkit-transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
    transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
    height: 32px;
    width: 52px;
    top: 0;
    left: 0;
    border-radius: 8px;
}

.toggle input+label:after {
    content: '';
    position: absolute;
    display: block;
    box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.02), 0 4px 0px 0 hsla(0, 0%, 0%, 0.01),
        0 4px 9px hsla(0, 0%, 0%, 0.08), 0 3px 3px hsla(0, 0%, 0%, 0.03);
    -webkit-transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
    transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
    background: #fff;
    height: 20px;
    width: 20px;
    top: 6px;
    left: 6px;
    border-radius: 6px;
}

.toggle input:checked+label:before {
    background: var(--color-primary);
    -webkit-transition: width 0.2s cubic-bezier(0, 0, 0, 0.1);
    transition: width 0.2s cubic-bezier(0, 0, 0, 0.1);
}

.toggle input:checked+label:after {
    left: 26px;
}
</style>
