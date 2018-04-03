import { DictSet } from '@glimmer/util';

export interface IRoute {
  name: string;
  id?: string;
  title: string;
  componentName: string;
  notFound: boolean;
}

export function getRouteDefinition(routeName: string): IRoute {
  if (routeName === '') {
    return {
      name: 'home',
      title: 'PPM',
      componentName: 'Home',
      notFound: false
    };
  }
  if (routeName === 'location') {
    return {
      name: 'location',
      title: 'PPM Location',
      componentName: 'Location',
      notFound: false
    };
  }
  return {
    name: 'notFound',
    title: 'Not found',
    componentName: 'NotFound',
    notFound: true
  };
}

export function getRouteFromPath(path: string): IRoute {
  if (path[0] === '/') {
    path = path.substring(1);
  }
  if (path[path.length - 1] === '/') {
    path = path.substring(0, path.length - 1);
  }
  let segments = path.split('/');

  let routeName = segments[0];

  return getRouteDefinition(routeName);
}
