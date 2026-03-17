import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/reducers/index';
import type { AppDispatch } from './configure-store';

// Strongly typed hooks for Redux Toolkit
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
