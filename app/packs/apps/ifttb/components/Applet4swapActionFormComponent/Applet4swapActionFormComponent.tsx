import { Close as CloseIcon, Down as DownIcon } from '@icon-park/react';
import { useDebounce } from 'ahooks';
import { FSwapActionThemeColor, FSwapLogoUrl } from 'apps/ifttb/constants';
import { PandoLake } from 'pando-sdk-js';
import { IAsset } from 'pando-sdk-js/dist/lake/types';
import React, { useState } from 'react';
import { Popup } from 'zarm';

let lakeAssets: IAsset[];
const pando = new PandoLake();
pando.assets().then((res) => {
  lakeAssets = res.data.assets.filter(
    (asset) => !asset.symbol.match(/^s(\S+-\S+)/),
  );
});

export function Applet4swapActionFormComponent(props: {
  onCancel: () => any;
  onFinish: (action) => any;
}) {
  const { onCancel, onFinish } = props;
  const [type, setType] = useState<null | 'swap' | 'add' | 'remove'>(null);
  const FswapTriggerItem = (props: {
    className?: string;
    children: JSX.Element | string;
    onClick?: () => any;
  }) => (
    <div
      onClick={props.onClick}
      className={`p-4 mb-4 text-center rounded ${props.className}`}
      style={{ background: FSwapActionThemeColor }}
    >
      {props.children}
    </div>
  );

  return (
    <>
      <div
        className='relative p-4 text-xl font-bold'
        style={{ background: FSwapActionThemeColor }}
      >
        <CloseIcon
          onClick={onCancel}
          className='absolute pt-1 left-8'
          size='1.25rem'
        />
        <div className='text-center'>Create 4swap Action</div>
      </div>
      <div
        className='px-4 pt-4 pb-8 mb-4'
        style={{ background: FSwapActionThemeColor }}
      >
        <div className='flex justify-center mb-4'>
          <img className='w-12 h-12' src={FSwapLogoUrl} />
        </div>
        <div className='text-sm'>
          Use 4swap to swap asset or add / remove liquidity.
        </div>
      </div>
      <div className='p-4 bg-white'>
        <FswapTriggerItem onClick={() => setType('swap')}>
          Swap
        </FswapTriggerItem>
        <FswapTriggerItem className='opacity-50'>
          Add liquidity
        </FswapTriggerItem>
        <FswapTriggerItem className='opacity-50'>
          Remove liquidity
        </FswapTriggerItem>
      </div>
      <Popup visible={Boolean(type)} onMaskClick={() => setType(null)}>
        <div className='relative overflow-scroll bg-white rounded-t-lg max-h-screen-3/4 min-h-screen-1/2'>
          <div className='sticky flex justify-center p-2'>
            <DownIcon size='2rem' />
          </div>
          {
            {
              swap: (
                <EditSwapAction
                  onFinish={(action) => {
                    onFinish(action);
                    setType(null);
                  }}
                />
              ),
            }[type]
          }
        </div>
      </Popup>
    </>
  );
}

function EditSwapAction(props: { onFinish: (action) => any }) {
  const [payAsset, setPayAsset] = useState<null | IAsset>(null);
  const [payAmount, setPayAmount] = useState<null | string>('');
  const [fillAsset, setFillAsset] = useState<null | IAsset>(null);
  const [selectingAsset, setSelectingAsset] = useState<
    null | 'payAsset' | 'fillAsset'
  >(null);
  const [slippage, setSlippage] = useState<0.001 | 0.005 | 0.01>(0.001);

  const validateParams = () => {
    if (
      !payAsset?.id ||
      !fillAsset?.id ||
      !parseFloat(payAmount) ||
      parseFloat(payAmount) < 0.00001 ||
      !slippage
    ) {
      return false;
    }

    return true;
  };

  const createAction = () => {
    if (validateParams()) {
      const action = {
        description: `swap ${payAmount} ${payAsset.symbol} to ${fillAsset.symbol}`,
        payAssetId: payAsset.id,
        fillAssetId: fillAsset.id,
        payAmount: parseFloat(payAmount),
        slippage,
      };
      props.onFinish(action);
    }
  };

  return (
    <div className='p-4'>
      <div className='mb-4'>
        <div className='flex items-center w-full bg-gray-100 rounded-full'>
          <div
            className='flex items-center space-x-2'
            onClick={() => setSelectingAsset('payAsset')}
          >
            {payAsset ? (
              <>
                <div className='relative'>
                  <img
                    className='p-1 rounded-full w-14 h-14'
                    src={payAsset.logo}
                  />
                  <img
                    className='absolute bottom-0 right-0 w-6 h-6 rounded'
                    src={payAsset.chain.logo}
                  />
                </div>
                <span>{payAsset.symbol}</span>
              </>
            ) : (
              <div className='p-4 text-xl font-bold text-center text-gray-300 bg-gray-100 rounded-full w-14 h-14'>
                ?
              </div>
            )}
          </div>
          <input
            className='flex-1 p-4 text-right bg-gray-100 rounded-r-full'
            placeholder='FROM'
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
          />
        </div>
        {payAsset && (
          <div className='text-sm text-right text-gray-500'>
            ≈ ${(payAsset.price * parseFloat(payAmount))?.toFixed(2)}
          </div>
        )}
      </div>
      <div className='flex items-center w-full mb-4 bg-gray-100 rounded-full'>
        <div
          className='flex items-center space-x-2'
          onClick={() => setSelectingAsset('fillAsset')}
        >
          {fillAsset ? (
            <>
              <div className='relative'>
                <img
                  className='p-1 rounded-full w-14 h-14'
                  src={fillAsset.logo}
                />
                <img
                  className='absolute bottom-0 right-0 w-6 h-6 rounded'
                  src={fillAsset.chain.logo}
                />
              </div>
              <span>{fillAsset.symbol}</span>
            </>
          ) : (
            <div className='p-4 text-xl font-bold text-center text-gray-300 bg-gray-100 rounded-full w-14 h-14'>
              ?
            </div>
          )}
        </div>
        <input
          className='flex-1 p-4 text-right bg-gray-100 rounded-r-full'
          placeholder='TO'
          disabled
        />
      </div>
      <div className='flex items-center mb-8 space-x-4'>
        <div className='text-gray-500'>Slippage:</div>
        <div className='flex items-center justify-around flex-1 text-xs'>
          <div
            className={`py-1 px-4 border cursor-pointer rounded ${
              slippage === 0.001 ? 'bg-dark text-white' : 'bg-white'
            }`}
            onClick={() => setSlippage(0.001)}
          >
            0.1%
          </div>
          <div
            className={`py-1 px-4 border cursor-pointer rounded ${
              slippage === 0.005 ? 'bg-dark text-white' : 'bg-white'
            }`}
            onClick={() => setSlippage(0.005)}
          >
            0.5%
          </div>
          <div
            className={`py-1 px-4 border cursor-pointer rounded ${
              slippage === 0.01 ? 'bg-dark text-white' : 'bg-white'
            }`}
            onClick={() => setSlippage(0.01)}
          >
            1%
          </div>
        </div>
      </div>
      <div
        className={`w-full p-4 text-xl text-center rounded-full cursor-pointer ${
          validateParams() ? 'opacity-100' : 'opacity-50'
        }`}
        style={{ background: FSwapActionThemeColor }}
        onClick={() => createAction()}
      >
        Create Action
      </div>
      <Popup
        visible={Boolean(selectingAsset)}
        onMaskClick={() => setSelectingAsset(null)}
      >
        <LakeAssetsList
          onClick={(asset) => {
            switch (selectingAsset) {
              case 'payAsset':
                if (asset.id != fillAsset?.id) {
                  setPayAsset(asset);
                  setPayAmount('1');
                  setSelectingAsset(null);
                }
                break;
              case 'fillAsset':
                if (asset.id != payAsset?.id) {
                  setFillAsset(asset);
                  setSelectingAsset(null);
                }
                break;
            }
          }}
        />
      </Popup>
    </div>
  );
}

function LakeAssetsList(props: { onClick: (asset) => any }) {
  const [query, setQuery] = useState('');
  const deboundedQuery = useDebounce(query, { wait: 500 });
  const assets = deboundedQuery
    ? lakeAssets.filter(
        (asset) =>
          asset.symbol.match(new RegExp(deboundedQuery, 'i')) ||
          asset.name.match(new RegExp(deboundedQuery, 'i')),
      )
    : lakeAssets;
  return (
    <div className='relative pt-12 overflow-y-scroll bg-white min-h-screen-1/2 max-h-screen-3/4'>
      <div className='fixed top-0 z-10 flex justify-center w-full p-2 bg-white'>
        <DownIcon size='2rem' />
      </div>
      <div className='px-4'>
        <input
          className='block w-full p-4 mb-4 bg-gray-100 rounded'
          placeholder='Search'
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
      </div>
      {(assets || []).map((asset) => (
        <div
          key={asset.id}
          className='flex items-center p-4 space-x-4'
          onClick={() => props.onClick(asset)}
        >
          <div className='relative'>
            <img className='w-8 h-8 rounded-full' src={asset.logo} />
            <img
              className='absolute bottom-0 right-0 w-4 h-4 rounded-full'
              src={asset.chain.logo}
            />
          </div>
          <span>{asset.symbol}</span>
        </div>
      ))}
    </div>
  );
}

function EditAddLiquidityAction() {}

function EditRemoveLiquidityAction() {}