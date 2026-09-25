// ABOUTME: Moves keyboard and screen-reader focus to a route's primary heading after navigation.

'use client';

import { useEffect, useRef } from 'react';

export function useFocusHeading() {
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        headingRef.current?.focus();
    }, []);

    return headingRef;
}