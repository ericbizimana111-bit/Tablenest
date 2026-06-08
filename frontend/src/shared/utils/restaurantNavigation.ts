export function getRestaurantMenuPath(restaurantId: string): string {
    return `/restaurants/${restaurantId}?tab=menu`;
}

export function getRestaurantBookPath(restaurantId: string): string {
    return `/restaurants/${restaurantId}?tab=book`;
}
