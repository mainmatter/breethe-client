import { DictSet } from '@glimmer/util';

export interface IRoute {
  name: string;
  param?: string;
  title: string;
  componentName: string;
  notFound: boolean;
}

export function getRouteDefinition(routeName: string, param: string): IRoute {
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
      notFound: false,
      param
    };
  }
  if (routeName === 'search') {
    return {
      name: 'search',
      title: 'PPM Location',
      componentName: 'Search',
      notFound: false,
      param
    };
  }
  return {
    name: routeName,
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
  let [routeName, id] = segments;

  return getRouteDefinition(routeName, id);
}
