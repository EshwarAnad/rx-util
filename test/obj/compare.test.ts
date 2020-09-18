import { compare } from '../../src/obj/compare'

describe('test compare', () => {
  describe('test basic type', () => {
    it('test NaN', () => {
      expect(compare(NaN, NaN)).toBeTrue()
    })
    it('test zero', () => {
      expect(compare(+0, -0)).toBeFalse()
      expect(compare(0, +0)).toBeTrue()
      expect(compare(-0, -0)).toBeTrue()
    })
    it('test float', () => {
      expect(compare(0.1 + 0.2, 0.3)).toBeTrue()
    })
    it('test RegExp', () => {
      expect(compare(/^\d+$/, /^\d+$/)).toBeTrue()
      expect(compare(/^\d+$/, new RegExp('^\\d+$'))).toBeTrue()
      expect(compare(new RegExp('^\\d+$'), new RegExp('^\\d+$'))).toBeTrue()
    })
    it('test string', () => {
      expect(compare('str', 'str')).toBeTrue()
      expect(compare('str', String('str'))).toBeTrue()
      expect(compare(String('str'), String('str'))).toBeTrue()
    })
    it('test number', () => {
      expect(compare(1, 1)).toBeTrue()
      expect(compare(1, Number(1))).toBeTrue()
      expect(compare(Number(1), Number(1))).toBeTrue()
    })
    it('test date', () => {
      const date1 = new Date('2018-12-11')
      const date2 = new Date('2018-12-11')
      expect(compare(date1, date2)).toBeTrue()
    })
  })
})
